const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/', authenticate, requireFamily, searchController.globalSearch);

module.exports = router;
