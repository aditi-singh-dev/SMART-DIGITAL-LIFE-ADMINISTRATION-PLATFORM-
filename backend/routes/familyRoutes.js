const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const { authenticate, requireFamily, requireAdmin } = require('../middleware/auth');

router.post('/', authenticate, familyController.createFamily);
router.post('/join', authenticate, familyController.joinFamily);
router.get('/current', authenticate, requireFamily, familyController.getFamily);
router.put('/current', authenticate, requireFamily, requireAdmin, familyController.updateFamily);
router.get('/health', authenticate, requireFamily, familyController.getHealthScoreEndpoint);
router.delete('/members/:memberUserId', authenticate, requireFamily, requireAdmin, familyController.removeMember);
router.patch('/members/:memberUserId/role', authenticate, requireFamily, requireAdmin, familyController.changeMemberRole);

module.exports = router;
