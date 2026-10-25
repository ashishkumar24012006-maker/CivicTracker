const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  updateUser,
  getDepartments,
  createDepartment,
  updateDepartment,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public or general read for departments (needed for issue reporting form)
router.get('/departments', getDepartments);

// All other administration routes are strictly protected for 'admin' role
router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id', protect, authorize('admin'), updateUser);
router.post('/departments', protect, authorize('admin'), createDepartment);
router.patch('/departments/:id', protect, authorize('admin'), updateDepartment);

module.exports = router;
