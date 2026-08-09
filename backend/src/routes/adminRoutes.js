const express = require('express');
const { getStats } = require('../controllers/adminController');
const { listUsers, setUserActive } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/users/:id/active', setUserActive);

module.exports = router;
