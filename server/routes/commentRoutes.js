const express = require('express');
const router = express.Router({ mergeParams: true });
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);

module.exports = router;
