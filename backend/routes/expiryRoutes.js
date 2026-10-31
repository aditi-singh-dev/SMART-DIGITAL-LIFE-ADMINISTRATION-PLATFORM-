const express = require('express');
const router = express.Router();
const expiryController = require('../controllers/expiryController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/', authenticate, requireFamily, expiryController.getExpiryOverview);
router.post('/reminders', authenticate, requireFamily, expiryController.setCustomReminder);

module.exports = router;
