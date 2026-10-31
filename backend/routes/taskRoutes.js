const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/', authenticate, requireFamily, taskController.getTasks);
router.post('/', authenticate, requireFamily, taskController.createTask);
router.put('/:id', authenticate, requireFamily, taskController.updateTask);
router.patch('/:id/toggle', authenticate, requireFamily, taskController.toggleTaskStatus);
router.delete('/:id', authenticate, requireFamily, taskController.deleteTask);

module.exports = router;
