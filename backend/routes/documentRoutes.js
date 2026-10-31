const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate, requireFamily } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticate, requireFamily, documentController.getDocuments);
router.post('/classify', authenticate, requireFamily, documentController.classifyDocSuggestion);
router.post('/', authenticate, requireFamily, upload.single('file'), documentController.uploadDocument);
router.get('/:id', authenticate, requireFamily, documentController.getDocumentById);
router.put('/:id', authenticate, requireFamily, documentController.updateDocument);
router.delete('/:id', authenticate, requireFamily, documentController.deleteDocument);
router.get('/:id/download', authenticate, requireFamily, documentController.downloadDocument);

module.exports = router;
