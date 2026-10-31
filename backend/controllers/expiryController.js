const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

function getExpiryOverview(req, res) {
  try {
    const familyId = req.user.familyId;
    const today = new Date().toISOString().split('T')[0];

    const docs = db.prepare(`
      SELECT 
        d.id, d.title, d.category, d.document_type, d.expiry_date, d.issue_date,
        d.issuing_authority, d.file_url, d.visibility,
        u.full_name as owner_name, u.avatar_color as owner_color
      FROM documents d
      JOIN users u ON u.id = d.owner_id
      WHERE d.family_id = ? AND d.expiry_date IS NOT NULL AND d.expiry_date != ''
      ORDER BY d.expiry_date ASC
    `).all(familyId);

    const nowMs = new Date().getTime();

    const result = {
      expired: [],
      next7Days: [],
      next30Days: [],
      next90Days: [],
      later: [],
      stats: {
        totalExpiringTracked: docs.length,
        expiredCount: 0,
        next7DaysCount: 0,
        next30DaysCount: 0,
        next90DaysCount: 0
      }
    };

    docs.forEach(doc => {
      const expDate = new Date(doc.expiry_date);
      const diffDays = Math.ceil((expDate.getTime() - nowMs) / (1000 * 60 * 60 * 24));
      const docWithMeta = {
        ...doc,
        days_remaining: diffDays
      };

      if (diffDays < 0) {
        result.expired.push({ ...docWithMeta, badge: 'Expired', badgeColor: 'red' });
        result.stats.expiredCount++;
      } else if (diffDays <= 7) {
        result.next7Days.push({ ...docWithMeta, badge: `${diffDays} days left`, badgeColor: 'red' });
        result.stats.next7DaysCount++;
      } else if (diffDays <= 30) {
        result.next30Days.push({ ...docWithMeta, badge: `${diffDays} days left`, badgeColor: 'amber' });
        result.stats.next30DaysCount++;
      } else if (diffDays <= 90) {
        result.next90Days.push({ ...docWithMeta, badge: `${diffDays} days left`, badgeColor: 'blue' });
        result.stats.next90DaysCount++;
      } else {
        result.later.push({ ...docWithMeta, badge: `${Math.round(diffDays / 30)} months left`, badgeColor: 'green' });
      }
    });

    return res.json({
      success: true,
      expiryData: result
    });
  } catch (error) {
    console.error('Expiry overview error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not fetch expiry tracking data.' });
  }
}

function setCustomReminder(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;
    const { document_id, days_before } = req.body;

    const doc = db.prepare('SELECT id, expiry_date, title FROM documents WHERE id = ? AND family_id = ?').get(document_id, familyId);
    if (!doc || !doc.expiry_date) {
      return res.status(400).json({ success: false, message: 'Document does not have a valid expiry date.' });
    }

    const expTime = new Date(doc.expiry_date).getTime();
    const reminderDate = new Date(expTime - days_before * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const remId = uuidv4();
    db.prepare(`
      INSERT INTO reminders (id, user_id, family_id, related_type, related_id, reminder_date, days_before, status)
      VALUES (?, ?, ?, 'document', ?, ?, ?, 'pending')
    `).run(remId, userId, familyId, doc.id, reminderDate, days_before);

    return res.status(201).json({
      success: true,
      message: `Reminder set for ${days_before} days before expiry of "${doc.title}".`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to configure reminder.' });
  }
}

module.exports = {
  getExpiryOverview,
  setCustomReminder
};
