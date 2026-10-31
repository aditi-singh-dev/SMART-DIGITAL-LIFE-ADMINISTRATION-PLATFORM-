const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/', authenticate, requireFamily, activityController.getActivityHistory);

module.exports = router;
