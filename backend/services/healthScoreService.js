const db = require('../config/db');

function calculateHealthScore(familyId) {
  if (!familyId) {
    return {
      score: 100,
      status: 'GOOD',
      summary: 'No family data to calculate health score.',
      breakdown: [],
      warnings: [],
      positives: []
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let score = 100;
  const breakdown = [];
  const warnings = [];
  const positives = [];

  // 1. Expired documents check
  const expiredDocs = db.prepare(`
    SELECT COUNT(*) as count FROM documents
    WHERE family_id = ? AND expiry_date IS NOT NULL AND expiry_date != '' AND expiry_date < ?
  `).get(familyId, today).count;

  if (expiredDocs > 0) {
    const penalty = Math.min(30, expiredDocs * 15);
    score -= penalty;
    warnings.push(`${expiredDocs} expired document${expiredDocs > 1 ? 's' : ''} require renewal`);
    breakdown.push({
      factor: 'Expired Documents',
      impact: `-${penalty} pts`,
      description: `${expiredDocs} document(s) past expiry date`
    });
  } else {
    positives.push('Zero expired documents');
  }

  // 2. Documents expiring in next 7 days
  const soonExpiringDocs = db.prepare(`
    SELECT COUNT(*) as count FROM documents
    WHERE family_id = ? AND expiry_date IS NOT NULL AND expiry_date != '' AND expiry_date >= ? AND expiry_date <= ?
  `).get(familyId, today, in7Days).count;

  if (soonExpiringDocs > 0) {
    const penalty = Math.min(15, soonExpiringDocs * 5);
    score -= penalty;
    warnings.push(`${soonExpiringDocs} document${soonExpiringDocs > 1 ? 's' : ''} expiring within 7 days`);
    breakdown.push({
      factor: 'Imminent Expirations',
      impact: `-${penalty} pts`,
      description: `${soonExpiringDocs} document(s) expiring within a week`
    });
  }

  // 3. Overdue tasks
  const overdueTasks = db.prepare(`
    SELECT COUNT(*) as count FROM tasks
    WHERE family_id = ? AND status != 'completed' AND due_date < ?
  `).get(familyId, today).count;

  if (overdueTasks > 0) {
    const penalty = Math.min(25, overdueTasks * 10);
    score -= penalty;
    warnings.push(`${overdueTasks} task${overdueTasks > 1 ? 's' : ''} overdue`);
    breakdown.push({
      factor: 'Overdue Tasks',
      impact: `-${penalty} pts`,
      description: `${overdueTasks} task(s) past due date without completion`
    });
  } else {
    positives.push('No overdue family tasks');
  }

  // 4. Pending urgent tasks
  const urgentTasks = db.prepare(`
    SELECT COUNT(*) as count FROM tasks
    WHERE family_id = ? AND status != 'completed' AND priority = 'urgent' AND due_date >= ?
  `).get(familyId, today).count;

  if (urgentTasks > 0) {
    const penalty = Math.min(10, urgentTasks * 5);
    score -= penalty;
    warnings.push(`${urgentTasks} urgent task${urgentTasks > 1 ? 's' : ''} pending`);
    breakdown.push({
      factor: 'Urgent Tasks Pending',
      impact: `-${penalty} pts`,
      description: `${urgentTasks} urgent task(s) need immediate attention`
    });
  }

  // 5. Incomplete administrative workflows with nearing deadline
  const incompleteWorkflows = db.prepare(`
    SELECT id, title, deadline FROM workflows
    WHERE family_id = ? AND status = 'active'
  `).all(familyId);

  let nearingDeadlineIncomplete = 0;
  for (const wf of incompleteWorkflows) {
    // Check if readiness < 100% and deadline within 30 days
    const totalItems = db.prepare('SELECT COUNT(*) as c FROM checklist_items WHERE workflow_id = ?').get(wf.id).c;
    const completedItems = db.prepare('SELECT COUNT(*) as c FROM checklist_items WHERE workflow_id = ? AND completed = 1').get(wf.id).c;
    
    if (totalItems > 0 && completedItems < totalItems) {
      if (wf.deadline && wf.deadline <= in30Days) {
        nearingDeadlineIncomplete++;
      }
    }
  }

  if (nearingDeadlineIncomplete > 0) {
    const penalty = Math.min(15, nearingDeadlineIncomplete * 5);
    score -= penalty;
    warnings.push(`${nearingDeadlineIncomplete} administrative workflow${nearingDeadlineIncomplete > 1 ? 's' : ''} nearing deadline`);
    breakdown.push({
      factor: 'Incomplete Workflows',
      impact: `-${penalty} pts`,
      description: `${nearingDeadlineIncomplete} workflow(s) have unfulfilled requirements`
    });
  } else if (incompleteWorkflows.length > 0) {
    positives.push('All active workflows are on schedule');
  }

  // Ensure score is between 10 and 100
  score = Math.max(10, Math.min(100, Math.round(score)));

  let status = 'GOOD';
  let message = 'Everything is mostly on track.';
  if (score >= 90) {
    status = 'EXCELLENT';
    message = 'Outstanding! Your family administration is remarkably well-organized.';
  } else if (score >= 75) {
    status = 'GOOD';
    message = 'Everything is mostly on track with minor action items pending.';
  } else if (score >= 55) {
    status = 'FAIR';
    message = 'Several important renewals and tasks require prompt attention.';
  } else {
    status = 'NEEDS ATTENTION';
    message = 'Urgent action required to resolve expired documents and overdue tasks.';
  }

  return {
    score,
    status,
    message,
    warnings,
    positives,
    breakdown,
    lastCalculated: new Date().toISOString()
  };
}

module.exports = { calculateHealthScore };
