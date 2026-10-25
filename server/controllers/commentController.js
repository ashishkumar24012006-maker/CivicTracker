const Comment = require('../models/Comment');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const ReportFollow = require('../models/ReportFollow');

// @desc    Add comment to a report
// @route   POST /api/reports/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { content, isOfficial, attachments } = req.body;
    const reportId = req.params.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty',
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Only staff and admin can mark official
    const officialFlag =
      isOfficial && (req.user.role === 'staff' || req.user.role === 'admin');

    const comment = await Comment.create({
      report: reportId,
      user: req.user._id,
      content,
      isOfficial: !!officialFlag,
      attachments: attachments || [],
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name role avatar department'
    );

    // Notify stakeholders
    try {
      const followers = await ReportFollow.find({ report: reportId }).select('user');
      const recipientIds = new Set(followers.map((f) => f.user.toString()));
      if (report.reporter) recipientIds.add(report.reporter.toString());
      if (report.assignedStaff) recipientIds.add(report.assignedStaff.toString());
      recipientIds.delete(req.user._id.toString());

      const notifs = Array.from(recipientIds).map((userId) => ({
        recipient: userId,
        sender: req.user._id,
        report: reportId,
        title: officialFlag ? 'Official Municipal Comment' : 'New Comment on Report',
        message: `${req.user.name}: "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}"`,
        type: 'NEW_COMMENT',
        link: `/reports/${reportId}`,
      }));

      if (notifs.length > 0) {
        await Notification.insertMany(notifs);
      }
    } catch (err) {
      console.error('Error delivering comment notifications:', err);
    }

    res.status(201).json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a report
// @route   GET /api/reports/:id/comments
// @access  Public / Private
exports.getComments = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const comments = await Comment.find({ report: reportId })
      .populate('user', 'name role avatar department')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};
