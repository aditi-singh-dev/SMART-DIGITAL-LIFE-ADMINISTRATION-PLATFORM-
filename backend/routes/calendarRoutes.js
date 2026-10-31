const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/', authenticate, requireFamily, calendarController.getCalendarEvents);

module.exports = router;
