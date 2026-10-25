const Report = require('../models/Report');
const User = require('../models/User');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const ReportFollow = require('../models/ReportFollow');

// Helper to notify all followers & reporter
const notifyReportStakeholders = async (reportId, senderId, title, message, type) => {
  try {
    const report = await Report.findById(reportId);
    if (!report) return;

    // Collect recipient IDs (reporter + all followers)
    const followers = await ReportFollow.find({ report: reportId }).select('user');
    const recipientIds = new Set(followers.map((f) => f.user.toString()));
    
    if (report.reporter) {
      recipientIds.add(report.reporter.toString());
    }
    if (report.assignedStaff) {
      recipientIds.add(report.assignedStaff.toString());
    }

    // Exclude the person who performed the action
    if (senderId) {
      recipientIds.delete(senderId.toString());
    }

    const notifications = Array.from(recipientIds).map((userId) => ({
      recipient: userId,
      sender: senderId,
      report: reportId,
      title,
      message,
      type,
      link: `/reports/${reportId}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Error sending report notifications:', err);
  }
};

// @desc    Create a new civic issue report
// @route   POST /api/reports
// @access  Private (Citizen, Admin)
exports.createReport = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      latitude,
      longitude,
      address,
      locality,
      landmark,
      images,
    } = req.body;

    if (!title || !description || !category || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and address',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude coordinates are required',
      });
    }

    // Format images
    const formattedImages = (images || []).map((img) =>
      typeof img === 'string' ? { url: img } : img
    );

    // Initial activity log
    const initialLog = {
      action: 'Report Submitted',
      by: req.user._id,
      byName: req.user.name,
      role: req.user.role,
      note: 'Issue reported by citizen',
      toStatus: 'Submitted',
      timestamp: new Date(),
    };

    // Auto-match department based on category
    let matchedDept = null;
    if (category) {
      const catMap = {
        'Pothole & Roads': 'Roads & Infrastructure',
        'Streetlight': 'Electrical & Lighting',
        'Water Supply & Leakage': 'Water & Sewage',
        'Garbage & Sanitation': 'Sanitation & Waste',
        'Drainage & Sewage': 'Water & Sewage',
        'Traffic & Signals': 'Traffic & Transportation',
        'Public Parks': 'Parks & Recreation',
      };
      const deptName = catMap[category];
      if (deptName) {
        matchedDept = await Department.findOne({ name: deptName });
      }
    }

    const report = await Report.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      address,
      locality: locality || '',
      landmark: landmark || '',
      images: formattedImages,
      reporter: req.user._id,
      assignedDepartment: matchedDept ? matchedDept._id : null,
      activityLogs: [initialLog],
    });

    const populated = await Report.findById(report._id)
      .populate('reporter', 'name email avatar phone')
      .populate('assignedDepartment', 'name code slaHours')
      .populate('assignedStaff', 'name email phone avatar');

    // Notify admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    const adminNotifs = admins.map((admin) => ({
      recipient: admin._id,
      sender: req.user._id,
      report: report._id,
      title: 'New Issue Reported',
      message: `"${title}" has been submitted in category: ${category}`,
      type: 'GENERAL',
      link: `/reports/${report._id}`,
    }));
    if (adminNotifs.length > 0) {
      await Notification.insertMany(adminNotifs);
    }

    res.status(201).json({
      success: true,
      report: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports with filtering, pagination, search
// @route   GET /api/reports
// @access  Public / Private
exports.getReports = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      department,
      assignedStaff,
      reporter,
      search,
      isOverdue,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }
    if (priority) {
      query.priority = priority;
    }
    if (department) {
      query.assignedDepartment = department;
    }
    if (assignedStaff) {
      query.assignedStaff = assignedStaff;
    }
    if (reporter) {
      query.reporter = reporter;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
      ];
    }

    if (isOverdue === 'true') {
      query.status = { $nin: ['Resolved', 'Verified', 'Rejected'] };
      query.deadline = { $lt: new Date() };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reporter', 'name email avatar')
      .populate('assignedDepartment', 'name code slaHours')
      .populate('assignedStaff', 'name email avatar phone')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Public / Private
exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email avatar phone role')
      .populate('assignedDepartment', 'name code slaHours contactEmail contactPhone')
      .populate('assignedStaff', 'name email phone avatar role department')
      .populate('activityLogs.by', 'name email role avatar')
      .populate('resolutionEvidence.uploadedBy', 'name email role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby reports using GeoJSON 2dsphere
// @route   GET /api/reports/nearby
// @access  Public
exports.getNearbyReports = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000, category, status } = req.query;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required',
      });
    }

    const maxDistanceMeters = parseFloat(radius);

    const filter = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    };

    if (category) filter.category = category;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('reporter', 'name email avatar')
      .populate('assignedDepartment', 'name code')
      .limit(50);

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status (Status Workflow Engine)
// @route   PATCH /api/reports/:id/status
// @access  Private (Staff, Admin, Citizen for Verification/Reopen)
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, note, reason } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const user = req.user;
    const oldStatus = report.status;

    // Role-based status transition restrictions
    const validStatuses = [
      'Submitted',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
      'Verified',
      'Rejected',
      'Reopened',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: ${status}`,
      });
    }

    // Citizen check: can only set 'Verified' or 'Reopened' on their own report
    if (user.role === 'citizen') {
      if (report.reporter.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Citizens can only verify or reopen their own reports',
        });
      }
      if (!['Verified', 'Reopened'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'Citizens can only transition resolved issues to Verified or Reopened',
        });
      }
    }

    // Staff check: can update assigned reports to 'In Progress' or 'Resolved'
    if (user.role === 'staff') {
      const isAssigned =
        (report.assignedStaff && report.assignedStaff.toString() === user._id.toString()) ||
        (report.assignedDepartment && user.department && report.assignedDepartment.toString() === user.department._id.toString());

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Staff can only update issues assigned to their department or person',
        });
      }

      if (!['In Progress', 'Resolved'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'Staff may only move issues to In Progress or Resolved',
        });
      }
    }

    // Record timestamps
    report.status = status;
    if (status === 'Resolved') {
      report.resolvedAt = new Date();
      if (note) report.resolutionNote = note;
    } else if (status === 'Verified') {
      report.verifiedAt = new Date();
    } else if (status === 'Rejected') {
      report.rejectedReason = reason || note || 'Issue rejected by administration';
    } else if (status === 'Reopened') {
      report.reopenReason = reason || note || 'Issue reopened by citizen';
      report.resolvedAt = null;
      report.verifiedAt = null;
    }

    // Append activity log
    report.activityLogs.push({
      action: `Status changed to ${status}`,
      by: user._id,
      byName: user.name,
      role: user.role,
      note: note || reason || `Status changed from ${oldStatus} to ${status}`,
      fromStatus: oldStatus,
      toStatus: status,
      timestamp: new Date(),
    });

    await report.save();

    // Notify stakeholders
    await notifyReportStakeholders(
      report._id,
      user._id,
      `Report Status Updated: ${status}`,
      `Report "${report.title}" status has changed to "${status}" by ${user.name}.`,
      'STATUS_UPDATE'
    );

    const updated = await Report.findById(report._id)
      .populate('reporter', 'name email avatar')
      .populate('assignedDepartment', 'name code slaHours')
      .populate('assignedStaff', 'name email phone avatar')
      .populate('activityLogs.by', 'name email role');

    res.status(200).json({
      success: true,
      report: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign report to department and staff with deadline & priority
// @route   PATCH /api/reports/:id/assign
// @access  Private (Admin)
exports.assignReport = async (req, res, next) => {
  try {
    const { departmentId, staffId, priority, deadline, note } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    let dept = null;
    if (departmentId) {
      dept = await Department.findById(departmentId);
      if (!dept) {
        return res.status(400).json({ success: false, message: 'Invalid department ID' });
      }
      report.assignedDepartment = dept._id;
    }

    let staff = null;
    if (staffId) {
      staff = await User.findById(staffId);
      if (!staff || staff.role !== 'staff') {
        return res.status(400).json({ success: false, message: 'Invalid staff member selected' });
      }
      report.assignedStaff = staff._id;
    }

    if (priority) {
      report.priority = priority;
    }

    if (deadline) {
      report.deadline = new Date(deadline);
    } else if (dept && dept.slaHours && !report.deadline) {
      // Auto-compute deadline from SLA hours
      const autoDeadline = new Date();
      autoDeadline.setHours(autoDeadline.getHours() + dept.slaHours);
      report.deadline = autoDeadline;
    }

    report.assignedAt = new Date();
    if (report.status === 'Submitted' || report.status === 'Under Review') {
      report.status = 'Assigned';
    }

    report.activityLogs.push({
      action: 'Report Assigned',
      by: req.user._id,
      byName: req.user.name,
      role: req.user.role,
      note:
        note ||
        `Assigned to ${dept ? dept.name : 'Department'}${staff ? ' (' + staff.name + ')' : ''}. Priority: ${report.priority}`,
      toStatus: report.status,
      timestamp: new Date(),
    });

    await report.save();

    // Send notifications to assigned staff
    if (staff) {
      await Notification.create({
        recipient: staff._id,
        sender: req.user._id,
        report: report._id,
        title: 'New Work Order Assigned',
        message: `You have been assigned to issue: "${report.title}". Priority: ${report.priority}`,
        type: 'ASSIGNMENT',
        link: `/reports/${report._id}`,
      });
    }

    // Notify reporter
    await notifyReportStakeholders(
      report._id,
      req.user._id,
      'Issue Assigned for Repair',
      `Your report "${report.title}" has been assigned to ${dept ? dept.name : 'a municipal department'}.`,
      'ASSIGNMENT'
    );

    const updated = await Report.findById(report._id)
      .populate('reporter', 'name email avatar')
      .populate('assignedDepartment', 'name code slaHours')
      .populate('assignedStaff', 'name email phone avatar')
      .populate('activityLogs.by', 'name email role');

    res.status(200).json({
      success: true,
      report: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit resolution evidence (Photos & Notes)
// @route   POST /api/reports/:id/evidence
// @access  Private (Staff, Admin)
exports.submitResolutionEvidence = async (req, res, next) => {
  try {
    const { url, note, markResolved } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Evidence image URL is required',
      });
    }

    report.resolutionEvidence.push({
      url,
      note: note || 'Resolution work evidence uploaded',
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
    });

    if (markResolved) {
      report.status = 'Resolved';
      report.resolvedAt = new Date();
      report.resolutionNote = note || 'Issue resolved with verified evidence';
    }

    report.activityLogs.push({
      action: markResolved ? 'Resolved with Evidence' : 'Resolution Evidence Added',
      by: req.user._id,
      byName: req.user.name,
      role: req.user.role,
      note: note || 'Uploaded resolution evidence photograph',
      toStatus: report.status,
      timestamp: new Date(),
    });

    await report.save();

    await notifyReportStakeholders(
      report._id,
      req.user._id,
      markResolved ? 'Issue Marked as Resolved!' : 'New Resolution Evidence Uploaded',
      `Staff uploaded work completion evidence for "${report.title}". Please review and confirm resolution.`,
      'STATUS_UPDATE'
    );

    const updated = await Report.findById(report._id)
      .populate('reporter', 'name email avatar')
      .populate('assignedDepartment', 'name code slaHours')
      .populate('assignedStaff', 'name email phone avatar')
      .populate('resolutionEvidence.uploadedBy', 'name email role');

    res.status(200).json({
      success: true,
      report: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Citizen confirms resolution or gives feedback
// @route   POST /api/reports/:id/verify
// @access  Private (Citizen Reporter)
exports.verifyReport = async (req, res, next) => {
  try {
    const { confirmed, comments, rating } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.reporter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the citizen reporter or an administrator can verify this issue',
      });
    }

    report.citizenFeedback = {
      confirmed: !!confirmed,
      comments: comments || '',
      rating: rating || 5,
      submittedAt: new Date(),
    };

    if (confirmed) {
      report.status = 'Verified';
      report.verifiedAt = new Date();
    } else {
      report.status = 'Reopened';
      report.reopenReason = comments || 'Citizen indicated the problem remains unresolved';
      report.resolvedAt = null;
    }

    report.activityLogs.push({
      action: confirmed ? 'Citizen Verified Resolution' : 'Citizen Rejected Resolution - Reopened',
      by: req.user._id,
      byName: req.user.name,
      role: req.user.role,
      note: comments || (confirmed ? 'Citizen confirmed resolution with rating ' + rating : 'Issue reopened'),
      toStatus: report.status,
      timestamp: new Date(),
    });

    await report.save();

    await notifyReportStakeholders(
      report._id,
      req.user._id,
      confirmed ? 'Issue Verified by Citizen' : 'Issue Reopened by Citizen',
      `Citizen feedback submitted for "${report.title}": ${confirmed ? 'Resolution Verified' : 'Reopened'}`,
      confirmed ? 'RESOLUTION_VERIFIED' : 'REPORT_REOPENED'
    );

    const updated = await Report.findById(report._id)
      .populate('reporter', 'name email avatar')
      .populate('assignedDepartment', 'name code slaHours')
      .populate('assignedStaff', 'name email phone avatar');

    res.status(200).json({
      success: true,
      report: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote a report
// @route   POST /api/reports/:id/upvote
// @access  Private
exports.toggleUpvote = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = report.upvotes.findIndex(
      (uid) => uid.toString() === userIdStr
    );

    let upvoted = false;
    if (existingIndex > -1) {
      report.upvotes.splice(existingIndex, 1);
      upvoted = false;
    } else {
      report.upvotes.push(req.user._id);
      upvoted = true;
    }

    await report.save();

    res.status(200).json({
      success: true,
      upvoted,
      upvotesCount: report.upvotes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Admin or Reporter if Submitted)
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const isReporter = report.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && (!isReporter || report.status !== 'Submitted')) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this report',
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
