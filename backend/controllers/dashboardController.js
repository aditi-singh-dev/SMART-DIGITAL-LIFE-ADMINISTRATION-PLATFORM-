const db = require('../config/db');
const { calculateHealthScore } = require('../services/healthScoreService');

function getDashboardSummary(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;

    if (!familyId) {
      return res.json({
        success: true,
        hasFamily: false,
        message: 'No family workspace joined yet.'
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Total Documents & Expiring Soon
    const docStats = db.prepare(`
      SELECT 
        COUNT(*) as total_documents,
        SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date != '' AND expiry_date <= ? AND expiry_date >= ? THEN 1 ELSE 0 END) as expiring_soon,
        SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date != '' AND expiry_date < ? THEN 1 ELSE 0 END) as expired_count
      FROM documents
      WHERE family_id = ?
    `).get(in30Days, today, today, familyId);

    // 2. Tasks stats
    const taskStats = db.prepare(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status != 'completed' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status != 'completed' AND due_date < ? THEN 1 ELSE 0 END) as overdue_tasks
      FROM tasks
      WHERE family_id = ?
    `).get(today, familyId);

    // 3. Upcoming deadlines (Tasks due in next 30 days + Workflows due in next 30 days)
    const upcomingTasksCount = db.prepare(`
      SELECT COUNT(*) as c FROM tasks
      WHERE family_id = ? AND status != 'completed' AND due_date >= ? AND due_date <= ?
    `).get(familyId, today, in30Days).c;

    const upcomingWorkflowsCount = db.prepare(`
      SELECT COUNT(*) as c FROM workflows
      WHERE family_id = ? AND status = 'active' AND deadline >= ? AND deadline <= ?
    `).get(familyId, today, in30Days).c;

    const upcomingDeadlines = upcomingTasksCount + upcomingWorkflowsCount;

    // 4. Family members count
    const memberCount = db.prepare('SELECT COUNT(*) as count FROM family_members WHERE family_id = ?')
      .get(familyId).count;

    // 5. Action Required Section items
    // Priority: Expiring in <= 15 days or expired, overdue tasks, urgent tasks, incomplete active workflows
    const actionRequired = [];

    // Expiring documents
    const urgentDocs = db.prepare(`
      SELECT d.id, d.title, d.category, d.document_type, d.expiry_date,
             u.full_name as owner_name
      FROM documents d
      JOIN users u ON u.id = d.owner_id
      WHERE d.family_id = ? AND d.expiry_date IS NOT NULL AND d.expiry_date != '' AND d.expiry_date <= ?
      ORDER BY d.expiry_date ASC
      LIMIT 4
    `).all(familyId, in15Days);

    const nowMs = Date.now();
    urgentDocs.forEach(d => {
      const days = Math.ceil((new Date(d.expiry_date).getTime() - nowMs) / (1000 * 60 * 60 * 24));
      let urgencyText = days < 0 ? 'Expired' : `Expires in ${days} day${days === 1 ? '' : 's'}`;
      let urgencyLevel = days < 0 || days <= 3 ? 'urgent' : 'high';

      actionRequired.push({
        id: `act-doc-${d.id}`,
        title: d.title,
        subtitle: `${d.category} · ${d.owner_name}`,
        tag: urgencyText,
        urgency: urgencyLevel,
        actionLabel: 'Review',
        link: '/vault'
      });
    });

    // Overdue or urgent tasks
    const urgentTasks = db.prepare(`
      SELECT t.id, t.title, t.due_date, t.priority, t.status,
             u.full_name as assignee_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.family_id = ? AND t.status != 'completed' AND (t.due_date < ? OR t.priority = 'urgent')
      ORDER BY t.due_date ASC
      LIMIT 3
    `).all(familyId, today);

    urgentTasks.forEach(t => {
      const isOverdue = t.due_date < today;
      actionRequired.push({
        id: `act-task-${t.id}`,
        title: t.title,
        subtitle: `Assigned to: ${t.assignee_name || 'Family'} · Priority: ${t.priority.toUpperCase()}`,
        tag: isOverdue ? 'Overdue' : 'Due Soon',
        urgency: 'urgent',
        actionLabel: 'View Task',
        link: '/tasks'
      });
    });

    // Incomplete workflows
    const nearingWorkflows = db.prepare(`
      SELECT w.id, w.title, w.deadline, w.category
      FROM workflows w
      WHERE w.family_id = ? AND w.status = 'active'
      ORDER BY w.deadline ASC
      LIMIT 2
    `).all(familyId);

    nearingWorkflows.forEach(w => {
      const total = db.prepare('SELECT COUNT(*) as c FROM checklist_items WHERE workflow_id = ?').get(w.id).c;
      const completed = db.prepare('SELECT COUNT(*) as c FROM checklist_items WHERE workflow_id = ? AND completed = 1').get(w.id).c;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      if (pct < 100) {
        actionRequired.push({
          id: `act-wf-${w.id}`,
          title: w.title,
          subtitle: `Readiness: ${pct}% (${completed}/${total} ready)`,
          tag: w.deadline ? `Due ${w.deadline}` : 'In Progress',
          urgency: 'medium',
          actionLabel: 'Continue',
          link: `/workflows/${w.id}`
        });
      }
    });

    // 6. Charts data: Documents by category
    const categoryBreakdown = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM documents
      WHERE family_id = ?
      GROUP BY category
      ORDER BY count DESC
    `).all(familyId);

    // 7. Monthly expirations distribution (next 6 months)
    const expiryTimeline = db.prepare(`
      SELECT strftime('%Y-%m', expiry_date) as month, COUNT(*) as count
      FROM documents
      WHERE family_id = ? AND expiry_date >= ?
      GROUP BY month
      ORDER BY month ASC
      LIMIT 6
    `).all(familyId, today);

    // 8. Health Score
    const health = calculateHealthScore(familyId);

    return res.json({
      success: true,
      hasFamily: true,
      summary: {
        totalDocuments: docStats ? (docStats.total_documents || 0) : 0,
        expiringSoon: docStats ? (docStats.expiring_soon || 0) : 0,
        expiredCount: docStats ? (docStats.expired_count || 0) : 0,
        upcomingDeadlines,
        pendingTasks: taskStats ? (taskStats.pending_tasks || 0) : 0,
        completedTasks: taskStats ? (taskStats.completed_tasks || 0) : 0,
        overdueTasks: taskStats ? (taskStats.overdue_tasks || 0) : 0,
        totalFamilyMembers: memberCount || 1
      },
      actionRequired: actionRequired.slice(0, 5),
      charts: {
        categoryBreakdown,
        taskDistribution: [
          { name: 'Pending', value: taskStats ? (taskStats.pending_tasks || 0) : 0, fill: '#4F46E5' },
          { name: 'Completed', value: taskStats ? (taskStats.completed_tasks || 0) : 0, fill: '#10B981' }
        ],
        expiryTimeline
      },
      health
    });
  } catch (error) {
    console.error('Dashboard summary error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not generate dashboard summary.' });
  }
}

module.exports = { getDashboardSummary };
