const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

function logActivity(familyId, userId, action, entityType, entityId = null, entityName = null, details = null) {
  if (!familyId || !userId) return;

  try {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO activity_logs (id, family_id, user_id, action, entity_type, entity_id, entity_name, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, familyId, userId, action, entityType, entityId, entityName, details);
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
}

module.exports = { logActivity };
