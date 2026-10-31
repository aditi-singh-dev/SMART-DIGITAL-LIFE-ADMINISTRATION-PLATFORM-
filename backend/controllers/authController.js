const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { logActivity } = require('../services/activityLogger');

const AVATAR_COLORS = [
  '#4F46E5', '#2563EB', '#0D9488', '#059669', 
  '#D97706', '#DC2626', '#7C3AED', '#DB2777'
];

async function register(req, res) {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, phone, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, full_name.trim(), normalizedEmail, passwordHash, phone ? phone.trim() : null, avatarColor);

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        full_name: full_name.trim(),
        email: normalizedEmail,
        phone: phone || null,
        avatar_color: avatarColor,
        familyId: null,
        familyName: null,
        familyRole: null
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Look up family membership
    const membership = db.prepare(`
      SELECT fm.family_id, fm.role, fm.relationship, f.family_name, f.invite_code
      FROM family_members fm
      JOIN families f ON f.id = fm.family_id
      WHERE fm.user_id = ?
      LIMIT 1
    `).get(user.id);

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        avatar_color: user.avatar_color,
        familyId: membership ? membership.family_id : null,
        familyName: membership ? membership.family_name : null,
        familyRole: membership ? membership.role : null,
        relationship: membership ? membership.relationship : null,
        inviteCode: membership ? membership.invite_code : null
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
}

function getMe(req, res) {
  return res.json({
    success: true,
    user: req.user
  });
}

function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = db.prepare('SELECT id, full_name, email FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      // Don't leak user existence
      return res.json({
        success: true,
        message: 'If this email is registered, password reset instructions have been generated.'
      });
    }

    // Generate 6-digit security code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
      .run(resetCode, expiry, user.id);

    return res.json({
      success: true,
      message: 'Password reset code has been sent/generated.',
      // We also return the code for instant demonstration in testing environments
      demoResetCode: resetCode
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not process password reset request.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, reset code, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user || user.reset_token !== resetCode) {
      return res.status(400).json({ success: false, message: 'Invalid or incorrect reset code.' });
    }

    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?')
      .run(passwordHash, user.id);

    return res.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not reset password.' });
  }
}

function updateProfile(req, res) {
  try {
    const { full_name, phone, avatar_color } = req.body;
    const userId = req.user.id;

    db.prepare(`
      UPDATE users 
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          avatar_color = COALESCE(?, avatar_color)
      WHERE id = ?
    `).run(full_name || null, phone || null, avatar_color || null, userId);

    const updatedUser = db.prepare('SELECT id, full_name, email, phone, avatar_color FROM users WHERE id = ?').get(userId);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        ...updatedUser,
        familyId: req.user.familyId,
        familyName: req.user.familyName,
        familyRole: req.user.familyRole
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile
};
