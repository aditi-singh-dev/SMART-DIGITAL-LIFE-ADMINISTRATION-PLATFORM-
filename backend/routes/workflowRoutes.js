const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/', authenticate, requireFamily, workflowController.getWorkflows);
router.post('/', authenticate, requireFamily, workflowController.createWorkflow);
router.get('/:id', authenticate, requireFamily, workflowController.getWorkflowById);
router.delete('/:id', authenticate, requireFamily, workflowController.deleteWorkflow);

// Checklist items
router.post('/:id/items', authenticate, requireFamily, workflowController.addChecklistItem);
router.patch('/items/:itemId', authenticate, requireFamily, workflowController.updateChecklistItem);
router.delete('/items/:itemId', authenticate, requireFamily, workflowController.deleteChecklistItem);

module.exports = router;
