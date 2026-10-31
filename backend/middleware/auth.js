const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'gharsahayak-super-secret-key-2026';

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB
    const user = db.prepare('SELECT id, full_name, email, phone, avatar_color, created_at FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    // Check family membership
    const membership = db.prepare(`
      SELECT fm.family_id, fm.role, fm.relationship, f.family_name, f.invite_code
      FROM family_members fm
      JOIN families f ON f.id = fm.family_id
      WHERE fm.user_id = ?
      LIMIT 1
    `).get(user.id);

    req.user = {
      ...user,
      familyId: membership ? membership.family_id : null,
      familyName: membership ? membership.family_name : null,
      familyRole: membership ? membership.role : null,
      relationship: membership ? membership.relationship : null,
      inviteCode: membership ? membership.invite_code : null
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
}

function requireFamily(req, res, next) {
  if (!req.user.familyId) {
    return res.status(403).json({
      success: false,
      message: 'You have not joined a family workspace yet. Please create or join a family first.'
    });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.user.familyRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only the Family Admin can perform this action.'
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireFamily,
  requireAdmin,
  JWT_SECRET
};
