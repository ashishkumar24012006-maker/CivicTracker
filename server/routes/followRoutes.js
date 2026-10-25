const express = require('express');
const router = express.Router();
const {
  toggleFollow,
  getFollowStatus,
  getUserFollowedReports,
} = require('../controllers/followController');
const { protect } = require('../middleware/auth');

router.get('/user/following', protect, getUserFollowedReports);
router.get('/:id/follow-status', protect, getFollowStatus);
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
