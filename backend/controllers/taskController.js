const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { logActivity } = require('../services/activityLogger');

function getTasks(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;
    const { tab, status, priority, assigned_to, search } = req.query;

    let query = `
      SELECT 
        t.*,
        u_assignee.full_name as assignee_name,
        u_assignee.avatar_color as assignee_color,
        u_creator.full_name as creator_name
      FROM tasks t
      LEFT JOIN users u_assignee ON u_assignee.id = t.assigned_to
      JOIN users u_creator ON u_creator.id = t.created_by
      WHERE t.family_id = ?
    `;
    const params = [familyId];

    if (tab === 'mine') {
      query += ` AND t.assigned_to = ?`;
      params.push(userId);
    } else if (tab === 'assigned_by_me') {
      query += ` AND t.created_by = ?`;
      params.push(userId);
    } else if (tab === 'completed') {
      query += ` AND t.status = 'completed'`;
    }

    if (status && status !== 'all') {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'all') {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (assigned_to && assigned_to !== 'all') {
      query += ` AND t.assigned_to = ?`;
      params.push(assigned_to);
    }

    if (search && search.trim()) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ` ORDER BY CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END, t.due_date ASC`;

    const tasks = db.prepare(query).all(...params);

    // Dynamic overdue status calculation
    const today = new Date().toISOString().split('T')[0];
    const enrichedTasks = tasks.map(task => {
      let isOverdue = false;
      if (task.status !== 'completed' && task.due_date < today) {
        isOverdue = true;
      }
      return {
        ...task,
        is_overdue: isOverdue
      };
    });

    return res.json({
      success: true,
      tasks: enrichedTasks
    });
  } catch (error) {
    console.error('Get tasks error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not fetch tasks.' });
  }
}

function createTask(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;
    const { title, description, assigned_to, due_date, priority } = req.body;

    if (!title || !title.trim() || !due_date) {
      return res.status(400).json({ success: false, message: 'Task title and due date are required.' });
    }

    const taskId = uuidv4();
    const assignedUserId = assigned_to || userId;
    const taskPriority = priority || 'medium';

    db.prepare(`
      INSERT INTO tasks (id, family_id, title, description, assigned_to, created_by, priority, status, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      taskId,
      familyId,
      title.trim(),
      description ? description.trim() : null,
      assignedUserId,
      userId,
      taskPriority,
      due_date
    );

    // Notify assigned member if different from creator
    if (assignedUserId && assignedUserId !== userId) {
      const notifId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (id, user_id, family_id, title, message, type, link)
        VALUES (?, ?, ?, 'New Family Task Assigned', ?, 'task', '/tasks')
      `).run(notifId, assignedUserId, familyId, `"${title.trim()}" due on ${due_date}.`);
    }

    logActivity(familyId, userId, `Created task "${title.trim()}"`, 'task', taskId, title.trim(), `Priority: ${taskPriority}`);

    const createdTask = db.prepare(`
      SELECT 
        t.*,
        u_assignee.full_name as assignee_name,
        u_assignee.avatar_color as assignee_color,
        u_creator.full_name as creator_name
      FROM tasks t
      LEFT JOIN users u_assignee ON u_assignee.id = t.assigned_to
      JOIN users u_creator ON u_creator.id = t.created_by
      WHERE t.id = ?
    `).get(taskId);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: createdTask
    });
  } catch (error) {
    console.error('Create task error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create task.' });
  }
}

function updateTask(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params;
    const { title, description, assigned_to, due_date, priority, status } = req.body;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND family_id = ?').get(id, familyId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    let completedAt = task.completed_at;
    if (status === 'completed' && task.status !== 'completed') {
      completedAt = new Date().toISOString();
    } else if (status && status !== 'completed') {
      completedAt = null;
    }

    db.prepare(`
      UPDATE tasks
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          assigned_to = COALESCE(?, assigned_to),
          due_date = COALESCE(?, due_date),
          priority = COALESCE(?, priority),
          status = COALESCE(?, status),
          completed_at = ?
      WHERE id = ? AND family_id = ?
    `).run(
      title ? title.trim() : null,
      description !== undefined ? description : null,
      assigned_to || null,
      due_date || null,
      priority || null,
      status || null,
      completedAt,
      id,
      familyId
    );

    if (status === 'completed' && task.status !== 'completed') {
      logActivity(familyId, req.user.id, `Completed task "${task.title}"`, 'task', id, task.title);
    }

    const updated = db.prepare(`
      SELECT 
        t.*,
        u_assignee.full_name as assignee_name,
        u_assignee.avatar_color as assignee_color,
        u_creator.full_name as creator_name
      FROM tasks t
      LEFT JOIN users u_assignee ON u_assignee.id = t.assigned_to
      JOIN users u_creator ON u_creator.id = t.created_by
      WHERE t.id = ?
    `).get(id);

    return res.json({
      success: true,
      message: 'Task updated successfully.',
      task: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
}

function toggleTaskStatus(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND family_id = ?').get(id, familyId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    db.prepare('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?').run(newStatus, completedAt, id);

    logActivity(
      familyId,
      req.user.id,
      newStatus === 'completed' ? `Completed task "${task.title}"` : `Reopened task "${task.title}"`,
      'task',
      id,
      task.title
    );

    return res.json({
      success: true,
      status: newStatus,
      completed_at: completedAt
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not toggle task status.' });
  }
}

function deleteTask(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params;

    const task = db.prepare('SELECT title FROM tasks WHERE id = ? AND family_id = ?').get(id, familyId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    logActivity(familyId, req.user.id, `Deleted task "${task.title}"`, 'task', id, task.title);

    return res.json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask
};
