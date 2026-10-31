const db = require('../config/db');

function getActivityHistory(req, res) {
  try {
    const familyId = req.user.familyId;

    const activities = db.prepare(`
      SELECT 
        a.*,
        u.full_name as user_name,
        u.avatar_color as user_color
      FROM activity_logs a
      JOIN users u ON u.id = a.user_id
      WHERE a.family_id = ?
      ORDER BY a.created_at DESC
      LIMIT 100
    `).all(familyId);

    return res.json({
      success: true,
      activities
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not fetch activity logs.' });
  }
}

module.exports = { getActivityHistory };
