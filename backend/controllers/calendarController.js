const db = require('../config/db');

function getCalendarEvents(req, res) {
  try {
    const familyId = req.user.familyId;
    const events = [];

    // 1. Document Expirations
    const docs = db.prepare(`
      SELECT 
        d.id, d.title, d.category, d.document_type, d.expiry_date, d.file_url,
        u.full_name as owner_name, u.avatar_color as owner_color
      FROM documents d
      JOIN users u ON u.id = d.owner_id
      WHERE d.family_id = ? AND d.expiry_date IS NOT NULL AND d.expiry_date != ''
    `).all(familyId);

    docs.forEach(d => {
      events.push({
        id: `doc-${d.id}`,
        rawId: d.id,
        title: `${d.title} (Expires)`,
        date: d.expiry_date,
        type: 'document_expiry',
        badge: 'Expiry',
        category: d.category,
        owner: d.owner_name,
        ownerColor: d.owner_color,
        description: `${d.document_type || 'Document'} is scheduled to expire on this date.`,
        link: '/vault'
      });
    });

    // 2. Task Deadlines
    const tasks = db.prepare(`
      SELECT 
        t.id, t.title, t.description, t.due_date, t.priority, t.status,
        u.full_name as assignee_name, u.avatar_color as assignee_color
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.family_id = ? AND t.due_date IS NOT NULL AND t.due_date != ''
    `).all(familyId);

    tasks.forEach(t => {
      events.push({
        id: `task-${t.id}`,
        rawId: t.id,
        title: `${t.title} (Task Due)`,
        date: t.due_date,
        type: 'task_deadline',
        badge: 'Task',
        priority: t.priority,
        status: t.status,
        owner: t.assignee_name || 'Unassigned',
        ownerColor: t.assignee_color,
        description: t.description || 'Family task deadline.',
        link: '/tasks'
      });
    });

    // 3. Workflow Deadlines
    const workflows = db.prepare(`
      SELECT 
        w.id, w.title, w.description, w.deadline, w.category, w.status,
        u.full_name as creator_name
      FROM workflows w
      JOIN users u ON u.id = w.created_by
      WHERE w.family_id = ? AND w.deadline IS NOT NULL AND w.deadline != ''
    `).all(familyId);

    workflows.forEach(w => {
      events.push({
        id: `wf-${w.id}`,
        rawId: w.id,
        title: `${w.title} (Application Due)`,
        date: w.deadline,
        type: 'workflow_deadline',
        badge: 'Workflow',
        category: w.category,
        status: w.status,
        owner: w.creator_name,
        description: w.description || 'Administrative application deadline.',
        link: `/workflows/${w.id}`
      });
    });

    // Sort chronologically
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Calendar events error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not fetch calendar events.' });
  }
}

module.exports = { getCalendarEvents };
