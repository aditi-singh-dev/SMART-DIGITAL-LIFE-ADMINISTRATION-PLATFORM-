const db = require('../config/db');

function globalSearch(req, res) {
  try {
    const familyId = req.user.familyId;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.json({
        success: true,
        results: {
          documents: [],
          tasks: [],
          workflows: [],
          members: []
        }
      });
    }

    const term = `%${q.trim()}%`;

    // 1. Documents
    const documents = db.prepare(`
      SELECT 
        d.id, d.title, d.category, d.document_type, d.expiry_date,
        u.full_name as owner_name
      FROM documents d
      JOIN users u ON u.id = d.owner_id
      WHERE d.family_id = ? AND (d.title LIKE ? OR d.document_type LIKE ? OR d.category LIKE ? OR d.issuing_authority LIKE ?)
      LIMIT 10
    `).all(familyId, term, term, term, term);

    // 2. Tasks
    const tasks = db.prepare(`
      SELECT 
        t.id, t.title, t.priority, t.status, t.due_date,
        u.full_name as assignee_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.family_id = ? AND (t.title LIKE ? OR t.description LIKE ?)
      LIMIT 10
    `).all(familyId, term, term);

    // 3. Workflows
    const workflows = db.prepare(`
      SELECT id, title, category, deadline, status
      FROM workflows
      WHERE family_id = ? AND (title LIKE ? OR description LIKE ? OR category LIKE ?)
      LIMIT 10
    `).all(familyId, term, term, term);

    // 4. Family Members
    const members = db.prepare(`
      SELECT u.id, u.full_name, u.email, fm.role, fm.relationship, u.avatar_color
      FROM family_members fm
      JOIN users u ON u.id = fm.user_id
      WHERE fm.family_id = ? AND (u.full_name LIKE ? OR u.email LIKE ? OR fm.relationship LIKE ?)
      LIMIT 10
    `).all(familyId, term, term, term);

    return res.json({
      success: true,
      query: q.trim(),
      results: {
        documents,
        tasks,
        workflows,
        members
      }
    });
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({ success: false, message: 'Global search failed.' });
  }
}

module.exports = { globalSearch };
