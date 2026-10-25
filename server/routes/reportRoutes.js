const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  getNearbyReports,
  updateReportStatus,
  assignReport,
  submitResolutionEvidence,
  verifyReport,
  toggleUpvote,
  deleteReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// Public or protected retrieval
router.get('/', getReports);
router.get('/nearby', getNearbyReports);
router.get('/:id', getReportById);

// Protected actions
router.post('/', protect, createReport);
router.patch('/:id/status', protect, updateReportStatus);
router.patch('/:id/assign', protect, authorize('admin'), assignReport);
router.post('/:id/evidence', protect, authorize('staff', 'admin'), submitResolutionEvidence);
router.post('/:id/verify', protect, verifyReport);
router.post('/:id/upvote', protect, toggleUpvote);
router.delete('/:id', protect, deleteReport);

module.exports = router;
