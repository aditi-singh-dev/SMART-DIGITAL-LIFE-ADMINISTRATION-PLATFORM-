const db = require('../config/db');

function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const familyId = req.user.familyId;

    // Check and generate dynamic alerts if not already notified today
    syncNotifications(userId, familyId);

    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(userId);

    const unreadCount = notifications.filter(n => n.is_read === 0).length;

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not fetch notifications.' });
  }
}

function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}

function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;

    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications.' });
  }
}

// Background sync to ensure timely alerts exist for expiries and tasks
function syncNotifications(userId, familyId) {
  if (!familyId) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Check for documents expiring within 7 days
    const expiringDocs = db.prepare(`
      SELECT id, title, expiry_date FROM documents
      WHERE family_id = ? AND expiry_date >= ? AND expiry_date <= ?
    `).all(familyId, today, in7);

    for (const doc of expiringDocs) {
      const exists = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND title LIKE ? AND created_at >= date('now', '-3 days')
      `).get(userId, `%${doc.title}%`);

      if (!exists) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, family_id, title, message, type, link)
          VALUES (?, ?, ?, ?, ?, 'expiry', '/vault')
        `).run(
          require('uuid').v4(),
          userId,
          familyId,
          `⚠️ ${doc.title} expires soon`,
          `Your document "${doc.title}" expires on ${doc.expiry_date}. Please review renewal.`
        );
      }
    }
  } catch (e) {
    // Silent fail for non-blocking notification generation
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
