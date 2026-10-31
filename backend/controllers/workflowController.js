const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { logActivity } = require('../services/activityLogger');

const WORKFLOW_TEMPLATES = {
  scholarship_application: {
    title: 'Scholarship Application',
    category: 'Education',
    description: 'Track mandatory documentation and declaration forms for academic scholarships.',
    items: [
      { title: 'Recent Passport Size Photograph', required: 1 },
      { title: 'Academic Marksheet (Previous Year / Semester)', required: 1 },
      { title: 'Admission Proof / College ID Card', required: 1 },
      { title: 'Bank Account Passbook / Cancelled Cheque', required: 1 },
      { title: 'Family Income Certificate (Tehsildar / SDO issued)', required: 1 },
      { title: 'Self-declaration & Undertaking Form', required: 1 }
    ]
  },
  college_admission: {
    title: 'College Admission',
    category: 'Education',
    description: 'Essential verification documents needed for university and college counseling.',
    items: [
      { title: 'Class 10th Certificate & Marksheet (DoB Proof)', required: 1 },
      { title: 'Class 12th Board Marksheet', required: 1 },
      { title: 'Transfer Certificate (TC) / School Leaving', required: 1 },
      { title: 'Migration Certificate', required: 1 },
      { title: 'Aadhaar Card Copy', required: 1 },
      { title: 'Seat Allotment Letter / Fee Receipt', required: 1 }
    ]
  },
  vehicle_insurance_renewal: {
    title: 'Vehicle Insurance Renewal',
    category: 'Vehicle',
    description: 'Annual motor insurance policy renewal checklist.',
    items: [
      { title: 'Previous Year Insurance Policy Copy', required: 1 },
      { title: 'Vehicle Registration Certificate (RC)', required: 1 },
      { title: 'Valid PUC (Pollution Under Control) Certificate', required: 1 },
      { title: 'Odometer Reading & Vehicle Inspection Photos', required: 0 }
    ]
  },
  passport_renewal: {
    title: 'Passport Renewal',
    category: 'Identity',
    description: 'Re-issue of Indian passport verification requirements.',
    items: [
      { title: 'Original Old Passport (First & Last 2 pages)', required: 1 },
      { title: 'Self-attested Copy of Aadhaar Card', required: 1 },
      { title: 'Current Residential Address Proof', required: 1 },
      { title: 'Annexure E / Self Declaration', required: 1 },
      { title: 'Two White Background Passport Photographs (35x45mm)', required: 1 }
    ]
  },
  school_admission: {
    title: 'School Admission',
    category: 'Education',
    description: 'Documentation for child school admission under general or nursery criteria.',
    items: [
      { title: 'Child Birth Certificate (Municipal Corporation)', required: 1 },
      { title: 'Immunization / Vaccination Record Card', required: 1 },
      { title: 'Parents Aadhaar & Address Proof', required: 1 },
      { title: 'Family Photograph (Child with Parents)', required: 1 },
      { title: 'Previous School Report Card (if applicable)', required: 0 }
    ]
  },
  warranty_claim: {
    title: 'Appliance Warranty Claim',
    category: 'Warranty',
    description: 'Proof of purchase and warranty paperwork for household equipment servicing.',
    items: [
      { title: 'Original Retail Purchase Tax Invoice', required: 1 },
      { title: 'Stamped Manufacturer Warranty Card', required: 1 },
      { title: 'Photo of Serial Number / Model Tag on Device', required: 1 },
      { title: 'Service Job Sheet / Prior Repair Log', required: 0 }
    ]
  },
  government_application: {
    title: 'Government Scheme Application',
    category: 'Government',
    description: 'Standard documentation for state & central welfare registrations.',
    items: [
      { title: 'Aadhaar Card of Applicant', required: 1 },
      { title: 'Ration Card / Family ID', required: 1 },
      { title: 'Domicile / Residence Certificate', required: 1 },
      { title: 'Bank Account Passbook Details', required: 1 },
      { title: 'Affidavit / Notarized Undertaking', required: 0 }
    ]
  }
};

function getWorkflows(req, res) {
  try {
    const familyId = req.user.familyId;
    const { status, category } = req.query;

    let query = `
      SELECT 
        w.*,
        u.full_name as creator_name
      FROM workflows w
      JOIN users u ON u.id = w.created_by
      WHERE w.family_id = ?
    `;
    const params = [familyId];

    if (status && status !== 'all') {
      query += ` AND w.status = ?`;
      params.push(status);
    }

    if (category && category !== 'all') {
      query += ` AND w.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY CASE WHEN w.status = 'completed' THEN 1 ELSE 0 END, w.created_at DESC`;

    const workflows = db.prepare(query).all(...params);

    const enriched = workflows.map(wf => {
      const items = db.prepare(`
        SELECT 
          ci.*,
          d.title as linked_doc_title,
          d.file_url as linked_doc_url,
          d.category as linked_doc_category
        FROM checklist_items ci
        LEFT JOIN documents d ON d.id = ci.document_id
        WHERE ci.workflow_id = ?
        ORDER BY ci.sort_order ASC, ci.title ASC
      `).all(wf.id);

      const totalItems = items.length;
      const completedItems = items.filter(i => i.completed === 1 || i.document_id).length;
      const readiness = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      const availableDocs = items.filter(i => i.completed === 1 || i.document_id).map(i => i.title);
      const missingDocs = items.filter(i => i.completed === 0 && !i.document_id).map(i => i.title);

      return {
        ...wf,
        readiness,
        total_items: totalItems,
        completed_items: completedItems,
        available_documents: availableDocs,
        missing_documents: missingDocs,
        items
      };
    });

    return res.json({
      success: true,
      workflows: enriched,
      templates: Object.keys(WORKFLOW_TEMPLATES).map(key => ({
        key,
        title: WORKFLOW_TEMPLATES[key].title,
        category: WORKFLOW_TEMPLATES[key].category,
        description: WORKFLOW_TEMPLATES[key].description,
        itemCount: WORKFLOW_TEMPLATES[key].items.length
      }))
    });
  } catch (error) {
    console.error('Get workflows error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not fetch administrative workflows.' });
  }
}

function getWorkflowById(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params;

    const wf = db.prepare(`
      SELECT w.*, u.full_name as creator_name
      FROM workflows w
      JOIN users u ON u.id = w.created_by
      WHERE w.id = ? AND w.family_id = ?
    `).get(id, familyId);

    if (!wf) {
      return res.status(404).json({ success: false, message: 'Administrative workflow not found.' });
    }

    const items = db.prepare(`
      SELECT 
        ci.*,
        d.title as linked_doc_title,
        d.file_url as linked_doc_url,
        d.category as linked_doc_category,
        d.expiry_date as linked_doc_expiry
      FROM checklist_items ci
      LEFT JOIN documents d ON d.id = ci.document_id
      WHERE ci.workflow_id = ?
      ORDER BY ci.sort_order ASC, ci.title ASC
    `).all(id);

    const total = items.length;
    const completed = items.filter(i => i.completed === 1 || i.document_id).length;
    const readiness = total > 0 ? Math.round((completed / total) * 100) : 0;

    const available = items.filter(i => i.completed === 1 || i.document_id).map(i => i.title);
    const missing = items.filter(i => i.completed === 0 && !i.document_id).map(i => i.title);

    return res.json({
      success: true,
      workflow: {
        ...wf,
        readiness,
        total_items: total,
        completed_items: completed,
        available_documents: available,
        missing_documents: missing,
        items
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not fetch workflow details.' });
  }
}

function createWorkflow(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;
    const { template_key, title, description, category, deadline, custom_items } = req.body;

    let wfTitle = title;
    let wfDesc = description;
    let wfCategory = category || 'General';
    let checklistItems = [];

    if (template_key && WORKFLOW_TEMPLATES[template_key]) {
      const tmpl = WORKFLOW_TEMPLATES[template_key];
      wfTitle = wfTitle || tmpl.title;
      wfDesc = wfDesc || tmpl.description;
      wfCategory = wfCategory || tmpl.category;
      checklistItems = tmpl.items.map(item => ({ ...item }));
    }

    if (!wfTitle || !wfTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Workflow title is required.' });
    }

    if (custom_items && Array.isArray(custom_items)) {
      checklistItems = custom_items.map(item => typeof item === 'string' ? { title: item, required: 1 } : item);
    }

    const workflowId = uuidv4();

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO workflows (id, family_id, title, description, category, deadline, created_by, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `).run(workflowId, familyId, wfTitle.trim(), wfDesc ? wfDesc.trim() : null, wfCategory, deadline || null, userId);

      const insertItem = db.prepare(`
        INSERT INTO checklist_items (id, workflow_id, title, required, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `);

      checklistItems.forEach((item, index) => {
        insertItem.run(uuidv4(), workflowId, item.title.trim(), item.required !== undefined ? item.required : 1, index);
      });
    });

    transaction();

    logActivity(familyId, userId, `Created administrative workflow "${wfTitle.trim()}"`, 'workflow', workflowId, wfTitle.trim());

    return res.status(201).json({
      success: true,
      message: 'Administrative workflow created successfully.',
      workflowId
    });
  } catch (error) {
    console.error('Create workflow error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create workflow.' });
  }
}

function updateChecklistItem(req, res) {
  try {
    const familyId = req.user.familyId;
    const { itemId } = req.params;
    const { completed, document_id, notes, title, required } = req.body;

    const item = db.prepare(`
      SELECT ci.*, w.family_id, w.title as workflow_title, w.id as workflow_id
      FROM checklist_items ci
      JOIN workflows w ON w.id = ci.workflow_id
      WHERE ci.id = ? AND w.family_id = ?
    `).get(itemId, familyId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found.' });
    }

    let isCompleted = completed !== undefined ? (completed ? 1 : 0) : item.completed;
    if (document_id) {
      isCompleted = 1;
    }
    const completedAt = isCompleted === 1 ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE checklist_items
      SET completed = ?,
          document_id = ?,
          completed_at = ?,
          notes = COALESCE(?, notes),
          title = COALESCE(?, title),
          required = COALESCE(?, required)
      WHERE id = ?
    `).run(
      isCompleted,
      document_id !== undefined ? document_id : item.document_id,
      completedAt,
      notes !== undefined ? notes : null,
      title ? title.trim() : null,
      required !== undefined ? (required ? 1 : 0) : null,
      itemId
    );

    // Calculate new readiness
    const items = db.prepare('SELECT completed, document_id FROM checklist_items WHERE workflow_id = ?').all(item.workflow_id);
    const total = items.length;
    const compCount = items.filter(i => i.completed === 1 || i.document_id).length;
    const readiness = total > 0 ? Math.round((compCount / total) * 100) : 0;

    // If 100% ready, update workflow status
    if (readiness === 100) {
      db.prepare('UPDATE workflows SET status = "completed" WHERE id = ?').run(item.workflow_id);
    } else {
      db.prepare('UPDATE workflows SET status = "active" WHERE id = ?').run(item.workflow_id);
    }

    return res.json({
      success: true,
      message: 'Checklist item updated.',
      readiness,
      completed: isCompleted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update checklist item.' });
  }
}

function addChecklistItem(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params; // workflow_id
    const { title, required } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Checklist title is required.' });
    }

    const wf = db.prepare('SELECT id FROM workflows WHERE id = ? AND family_id = ?').get(id, familyId);
    if (!wf) {
      return res.status(404).json({ success: false, message: 'Workflow not found.' });
    }

    const itemId = uuidv4();
    const count = db.prepare('SELECT COUNT(*) as c FROM checklist_items WHERE workflow_id = ?').get(id).c;

    db.prepare(`
      INSERT INTO checklist_items (id, workflow_id, title, required, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(itemId, id, title.trim(), required !== undefined ? (required ? 1 : 0) : 1, count);

    return res.status(201).json({
      success: true,
      message: 'Requirement added to checklist.',
      itemId
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add requirement.' });
  }
}

function deleteChecklistItem(req, res) {
  try {
    const familyId = req.user.familyId;
    const { itemId } = req.params;

    const item = db.prepare(`
      SELECT ci.id, ci.workflow_id
      FROM checklist_items ci
      JOIN workflows w ON w.id = ci.workflow_id
      WHERE ci.id = ? AND w.family_id = ?
    `).get(itemId, familyId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    db.prepare('DELETE FROM checklist_items WHERE id = ?').run(itemId);

    return res.json({
      success: true,
      message: 'Checklist item removed.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete checklist item.' });
  }
}

function deleteWorkflow(req, res) {
  try {
    const familyId = req.user.familyId;
    const { id } = req.params;

    const wf = db.prepare('SELECT title FROM workflows WHERE id = ? AND family_id = ?').get(id, familyId);
    if (!wf) {
      return res.status(404).json({ success: false, message: 'Workflow not found.' });
    }

    db.prepare('DELETE FROM workflows WHERE id = ?').run(id);
    logActivity(familyId, req.user.id, `Deleted workflow "${wf.title}"`, 'workflow', id, wf.title);

    return res.json({
      success: true,
      message: 'Workflow deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete workflow.' });
  }
}

module.exports = {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
  deleteWorkflow,
  WORKFLOW_TEMPLATES
};
