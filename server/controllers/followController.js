const ReportFollow = require('../models/ReportFollow');
const Report = require('../models/Report');

// @desc    Toggle follow / unfollow report
// @route   POST /api/reports/:id/follow
// @access  Private
exports.toggleFollow = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const userId = req.user._id;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const existingFollow = await ReportFollow.findOne({
      user: userId,
      report: reportId,
    });

    if (existingFollow) {
      await existingFollow.deleteOne();
      return res.status(200).json({
        success: true,
        following: false,
        message: 'Unfollowed report successfully',
      });
    } else {
      await ReportFollow.create({
        user: userId,
        report: reportId,
      });
      return res.status(201).json({
        success: true,
        following: true,
        message: 'Following report for notifications and status updates',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Check if current user follows report
// @route   GET /api/reports/:id/follow-status
// @access  Private
exports.getFollowStatus = async (req, res, next) => {
  try {
    const follow = await ReportFollow.findOne({
      user: req.user._id,
      report: req.params.id,
    });

    res.status(200).json({
      success: true,
      following: !!follow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's followed reports
// @route   GET /api/reports/user/following
// @access  Private
exports.getUserFollowedReports = async (req, res, next) => {
  try {
    const follows = await ReportFollow.find({ user: req.user._id })
      .populate({
        path: 'report',
        populate: [
          { path: 'assignedDepartment', select: 'name code' },
          { path: 'reporter', select: 'name avatar' },
        ],
      })
      .sort('-createdAt');

    const reports = follows.map((f) => f.report).filter(Boolean);

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};
