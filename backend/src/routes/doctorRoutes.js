const express = require('express');
const { listDoctors, getDoctor, updateDoctor } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.put('/:id', protect, authorize('doctor', 'admin'), updateDoctor);

module.exports = router;
