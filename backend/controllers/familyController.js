const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { logActivity } = require('../services/activityLogger');
const { calculateHealthScore } = require('../services/healthScoreService');

// Generate short, elegant 6-character alphanumeric code
function generateInviteCode(familyName) {
  const prefix = familyName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix || 'GHAR'}-${randomChars}`;
}

function createFamily(req, res) {
  try {
    const { family_name, relationship } = req.body;
    const userId = req.user.id;

    if (!family_name || !family_name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a family name (e.g., Singh Family).' });
    }

    // Check if user already belongs to a family
    const existing = db.prepare('SELECT family_id FROM family_members WHERE user_id = ?').get(userId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already belong to a family workspace.' });
    }

    const familyId = uuidv4();
    const inviteCode = generateInviteCode(family_name);

    const transaction = db.transaction(() => {
      // Create family
      db.prepare(`
        INSERT INTO families (id, family_name, invite_code, created_by)
        VALUES (?, ?, ?, ?)
      `).run(familyId, family_name.trim(), inviteCode, userId);

      // Add creator as Admin
      const memberId = uuidv4();
      db.prepare(`
        INSERT INTO family_members (id, family_id, user_id, role, relationship)
        VALUES (?, ?, ?, 'admin', ?)
      `).run(memberId, familyId, userId, relationship || 'Head of Family');

      // Create a welcome notification
      const notifId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (id, user_id, family_id, title, message, type, link)
        VALUES (?, ?, ?, 'Welcome to GharSahayak!', 'Your family workspace has been created. Invite members and start organizing documents.', 'system', '/vault')
      `).run(notifId, userId, familyId);
    });

    transaction();

    logActivity(familyId, userId, 'Created the family workspace', 'family', familyId, family_name.trim());

    return res.status(201).json({
      success: true,
      message: `Family workspace "${family_name}" created successfully!`,
      family: {
        id: familyId,
        family_name: family_name.trim(),
        invite_code: inviteCode,
        role: 'admin',
        relationship: relationship || 'Head of Family'
      }
    });
  } catch (error) {
    console.error('Create family error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not create family workspace.' });
  }
}

function joinFamily(req, res) {
  try {
    const { invite_code, relationship } = req.body;
    const userId = req.user.id;

    if (!invite_code || !invite_code.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid family invite code.' });
    }

    // Check if user already in a family
    const existing = db.prepare('SELECT family_id FROM family_members WHERE user_id = ?').get(userId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already belong to a family workspace.' });
    }

    const family = db.prepare('SELECT * FROM families WHERE UPPER(invite_code) = UPPER(?)')
      .get(invite_code.trim());

    if (!family) {
      return res.status(404).json({ success: false, message: 'Invalid invite code. Family workspace not found.' });
    }

    const memberId = uuidv4();
    db.prepare(`
      INSERT INTO family_members (id, family_id, user_id, role, relationship)
      VALUES (?, ?, ?, 'member', ?)
    `).run(memberId, family.id, userId, relationship || 'Member');

    logActivity(family.id, userId, 'Joined the family workspace', 'user', userId, req.user.full_name);

    return res.json({
      success: true,
      message: `Successfully joined ${family.family_name}!`,
      family: {
        id: family.id,
        family_name: family.family_name,
        invite_code: family.invite_code,
        role: 'member',
        relationship: relationship || 'Member'
      }
    });
  } catch (error) {
    console.error('Join family error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not join family workspace.' });
  }
}

function getFamily(req, res) {
  try {
    const familyId = req.user.familyId;
    if (!familyId) {
      return res.status(404).json({ success: false, message: 'No family workspace found for user.' });
    }

    const family = db.prepare('SELECT * FROM families WHERE id = ?').get(familyId);
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found.' });
    }

    // Fetch members with stats
    const members = db.prepare(`
      SELECT 
        fm.id as membership_id,
        fm.role,
        fm.relationship,
        fm.joined_at,
        u.id as user_id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_color,
        (SELECT COUNT(*) FROM documents d WHERE d.owner_id = u.id AND d.family_id = fm.family_id) as document_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = u.id AND t.family_id = fm.family_id AND t.status != 'completed') as active_task_count
      FROM family_members fm
      JOIN users u ON u.id = fm.user_id
      WHERE fm.family_id = ?
      ORDER BY CASE WHEN fm.role = 'admin' THEN 0 ELSE 1 END, fm.joined_at ASC
    `).all(familyId);

    return res.json({
      success: true,
      family: {
        ...family,
        members
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not retrieve family details.' });
  }
}

function updateFamily(req, res) {
  try {
    const familyId = req.user.familyId;
    const { family_name } = req.body;

    if (!family_name || !family_name.trim()) {
      return res.status(400).json({ success: false, message: 'Family name cannot be empty.' });
    }

    db.prepare('UPDATE families SET family_name = ? WHERE id = ?').run(family_name.trim(), familyId);
    logActivity(familyId, req.user.id, `Renamed family workspace to "${family_name.trim()}"`, 'family', familyId, family_name.trim());

    return res.json({
      success: true,
      message: 'Family workspace updated successfully.',
      family_name: family_name.trim()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update family workspace.' });
  }
}

function removeMember(req, res) {
  try {
    const familyId = req.user.familyId;
    const { memberUserId } = req.params;

    if (memberUserId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Family Admin cannot remove themselves. Transfer admin role first.' });
    }

    const member = db.prepare('SELECT u.full_name FROM family_members fm JOIN users u ON u.id = fm.user_id WHERE fm.family_id = ? AND fm.user_id = ?')
      .get(familyId, memberUserId);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Family member not found.' });
    }

    db.prepare('DELETE FROM family_members WHERE family_id = ? AND user_id = ?').run(familyId, memberUserId);
    logActivity(familyId, req.user.id, `Removed member ${member.full_name}`, 'user', memberUserId, member.full_name);

    return res.json({
      success: true,
      message: `Member ${member.full_name} was removed from the family workspace.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove member.' });
  }
}

function changeMemberRole(req, res) {
  try {
    const familyId = req.user.familyId;
    const { memberUserId } = req.params;
    const { role } = req.body;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either "admin" or "member".' });
    }

    db.prepare('UPDATE family_members SET role = ? WHERE family_id = ? AND user_id = ?')
      .run(role, familyId, memberUserId);

    const targetUser = db.prepare('SELECT full_name FROM users WHERE id = ?').get(memberUserId);
    logActivity(familyId, req.user.id, `Updated role of ${targetUser ? targetUser.full_name : 'member'} to ${role}`, 'user', memberUserId);

    return res.json({
      success: true,
      message: 'Member role updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update member role.' });
  }
}

function getHealthScoreEndpoint(req, res) {
  try {
    const familyId = req.user.familyId;
    const health = calculateHealthScore(familyId);
    return res.json({
      success: true,
      health
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not calculate health score.' });
  }
}

module.exports = {
  createFamily,
  joinFamily,
  getFamily,
  updateFamily,
  removeMember,
  changeMemberRole,
  getHealthScoreEndpoint
};
