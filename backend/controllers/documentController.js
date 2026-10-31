const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { logActivity } = require('../services/activityLogger');
const { classifyDocument } = require('../services/classifierService');

function classifyDocSuggestion(req, res) {
  try {
    const { filename, title, notes } = req.body;
    if (!filename && !title) {
      return res.status(400).json({ success: false, message: 'Please provide filename or title.' });
    }
    const suggestion = classifyDocument(filename || '', title || '', notes || '');
    return res.json({
      success: true,
      suggestion
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Classification failed.' });
  }
}

function uploadDocument(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a document file to upload.' });
    }

    const {
      title,
      category,
      document_type,
      owner_id,
      issue_date,
      expiry_date,
      issuing_authority,
      visibility,
      notes
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Document title is required.' });
    }

    const docId = uuidv4();
    const fileUrl = `/uploads/${req.file.filename}`;
    const selectedCategory = category || 'Other';
    const selectedDocType = document_type || 'General Document';
    const docOwnerId = owner_id || userId;
    const docVisibility = visibility === 'private' ? 'private' : 'family';

    db.prepare(`
      INSERT INTO documents (
        id, family_id, owner_id, title, category, document_type,
        issue_date, expiry_date, issuing_authority, file_url,
        original_filename, file_size, mime_type, visibility, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      docId,
      familyId,
      docOwnerId,
      title.trim(),
      selectedCategory,
      selectedDocType,
      issue_date || null,
      expiry_date || null,
      issuing_authority ? issuing_authority.trim() : null,
      fileUrl,
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      docVisibility,
      notes ? notes.trim() : null
    );

    // If document has expiry date, automatically create reminders
    if (expiry_date) {
      const expTime = new Date(expiry_date).getTime();
      const intervals = [90, 30, 15, 7, 1];

      for (const days of intervals) {
        const reminderTime = new Date(expTime - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const remId = uuidv4();
        db.prepare(`
          INSERT INTO reminders (id, user_id, family_id, related_type, related_id, reminder_date, days_before, status)
          VALUES (?, ?, ?, 'document', ?, ?, ?, 'pending')
        `).run(remId, docOwnerId, familyId, docId, reminderTime, days);
      }
    }

    logActivity(familyId, userId, `Uploaded document "${title.trim()}"`, 'document', docId, title.trim(), `Category: ${selectedCategory}`);

    const newDoc = db.prepare(`
      SELECT d.*, u.full_name as owner_name, u.avatar_color as owner_color
      FROM documents d
      JOIN users u ON u.id = d.owner_id
      WHERE d.id = ?
    `).get(docId);

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and securely encrypted/stored.',
      document: newDoc
    });
  } catch (error) {
    console.error('Upload document error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to upload document.' });
  }
}

function getDocuments(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;
    const { category, owner_id, search, expiry_status, visibility } = req.query;

    let query = `
      SELECT 
        d.*,
        u.full_name as owner_name,
        u.avatar_color as owner_color
      FROM documents d
      JOIN users u ON u.id = d.owner_id
      WHERE d.family_id = ?
    `;
    const params = [familyId];

    // Privacy rule: non-admin can only see 'family' documents or their own 'private' documents
    if (req.user.familyRole !== 'admin') {
      query += ` AND (d.visibility = 'family' OR d.owner_id = ?)`;
      params.push(userId);
    }

    if (category && category !== 'All') {
      query += ` AND d.category = ?`;
      params.push(category);
    }

    if (owner_id && owner_id !== 'all') {
      query += ` AND d.owner_id = ?`;
      params.push(owner_id);
    }

    if (visibility && ['family', 'private'].includes(visibility)) {
      query += ` AND d.visibility = ?`;
      params.push(visibility);
    }

    if (search && search.trim()) {
      query += ` AND (d.title LIKE ? OR d.document_type LIKE ? OR d.issuing_authority LIKE ? OR d.notes LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    const today = new Date().toISOString().split('T')[0];
    const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (expiry_status) {
      if (expiry_status === 'expired') {
        query += ` AND d.expiry_date IS NOT NULL AND d.expiry_date != '' AND d.expiry_date < ?`;
        params.push(today);
      } else if (expiry_status === '7_days') {
        query += ` AND d.expiry_date >= ? AND d.expiry_date <= ?`;
        params.push(today, in7);
      } else if (expiry_status === '30_days') {
        query += ` AND d.expiry_date > ? AND d.expiry_date <= ?`;
        params.push(in7, in30);
      } else if (expiry_status === '90_days') {
        query += ` AND d.expiry_date > ? AND d.expiry_date <= ?`;
        params.push(in30, in90);
      } else if (expiry_status === 'valid') {
        query += ` AND (d.expiry_date IS NULL OR d.expiry_date = '' OR d.expiry_date > ?)`;
        params.push(in90);
      }
    }

    query += ` ORDER BY d.created_at DESC`;

    const documents = db.prepare(query).all(...params);

    // Compute remaining days dynamically
    const enriched = documents.map(doc => {
      let daysRemaining = null;
      let statusTag = 'valid';

      if (doc.expiry_date) {
        const diffMs = new Date(doc.expiry_date).getTime() - new Date().getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) {
          statusTag = 'expired';
        } else if (daysRemaining <= 7) {
          statusTag = 'urgent';
        } else if (daysRemaining <= 30) {
          statusTag = 'approaching';
        } else {
          statusTag = 'valid';
        }
      }

      return {
        ...doc,
        days_remaining: daysRemaining,
        status_tag: statusTag
      };
    });

    return res.json({
      success: true,
      documents: enriched,
      total: enriched.length
    });
  } catch (error) {
    console.error('Get documents error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not fetch documents.' });
  }
}

function getDocumentById(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params;

    const doc = db.prepare(`
      SELECT 
        d.*,
        u.full_name as owner_name,
        u.email as owner_email,
        u.avatar_color as owner_color
      FROM documents d
      JOIN users u ON u.id = d.owner_id
      WHERE d.id = ? AND d.family_id = ?
    `).get(id, familyId);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    // Check visibility permissions
    if (doc.visibility === 'private' && doc.owner_id !== req.user.id && req.user.familyRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'This document is marked as Private by its owner.' });
    }

    // Get linked workflows/checklist items
    const linkedChecklists = db.prepare(`
      SELECT ci.title as requirement_name, w.title as workflow_title, w.id as workflow_id
      FROM checklist_items ci
      JOIN workflows w ON w.id = ci.workflow_id
      WHERE ci.document_id = ?
    `).all(id);

    return res.json({
      success: true,
      document: {
        ...doc,
        linked_workflows: linkedChecklists
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not fetch document details.' });
  }
}

function updateDocument(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params;
    const {
      title,
      category,
      document_type,
      owner_id,
      issue_date,
      expiry_date,
      issuing_authority,
      visibility,
      notes
    } = req.body;

    const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND family_id = ?').get(id, familyId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Permission check: admin or owner
    if (doc.owner_id !== req.user.id && req.user.familyRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission denied to edit this document.' });
    }

    db.prepare(`
      UPDATE documents
      SET title = COALESCE(?, title),
          category = COALESCE(?, category),
          document_type = COALESCE(?, document_type),
          owner_id = COALESCE(?, owner_id),
          issue_date = COALESCE(?, issue_date),
          expiry_date = COALESCE(?, expiry_date),
          issuing_authority = COALESCE(?, issuing_authority),
          visibility = COALESCE(?, visibility),
          notes = COALESCE(?, notes)
      WHERE id = ? AND family_id = ?
    `).run(
      title ? title.trim() : null,
      category || null,
      document_type || null,
      owner_id || null,
      issue_date || null,
      expiry_date || null,
      issuing_authority || null,
      visibility || null,
      notes !== undefined ? notes : null,
      id,
      familyId
    );

    logActivity(familyId, req.user.id, `Updated document "${title || doc.title}"`, 'document', id, title || doc.title);

    const updated = db.prepare(`
      SELECT d.*, u.full_name as owner_name, u.avatar_color as owner_color
      FROM documents d
      JOIN users u ON u.id = d.owner_id
      WHERE d.id = ?
    `).get(id);

    return res.json({
      success: true,
      message: 'Document metadata updated successfully.',
      document: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update document.' });
  }
}

function deleteDocument(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params;

    const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND family_id = ?').get(id, familyId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (doc.owner_id !== req.user.id && req.user.familyRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission denied to delete this document.' });
    }

    // Try deleting file from disk
    if (doc.file_url) {
      const filename = path.basename(doc.file_url);
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not remove file from disk:', e.message);
        }
      }
    }

    // Delete record & unlink checklists
    db.prepare('UPDATE checklist_items SET document_id = NULL WHERE document_id = ?').run(id);
    db.prepare('DELETE FROM reminders WHERE related_type = "document" AND related_id = ?').run(id);
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);

    logActivity(familyId, req.user.id, `Deleted document "${doc.title}"`, 'document', id, doc.title);

    return res.json({
      success: true,
      message: `Document "${doc.title}" was deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
}

function downloadDocument(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params;

    const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND family_id = ?').get(id, familyId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (doc.visibility === 'private' && doc.owner_id !== req.user.id && req.user.familyRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to private document.' });
    }

    const filename = path.basename(doc.file_url);
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found on server.' });
    }

    return res.download(filePath, doc.original_filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Download failed.' });
  }
}

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  classifyDocSuggestion
};
