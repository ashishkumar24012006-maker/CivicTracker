const Report = require('../models/Report');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get complete administrative dashboard statistics & analytics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({
      status: { $in: ['Submitted', 'Under Review', 'Assigned', 'Reopened'] },
    });
    const inProgressReports = await Report.countDocuments({ status: 'In Progress' });
    const resolvedReports = await Report.countDocuments({
      status: { $in: ['Resolved', 'Verified'] },
    });
    const rejectedReports = await Report.countDocuments({ status: 'Rejected' });

    // Overdue count: deadline in past and not closed
    const overdueReports = await Report.countDocuments({
      status: { $nin: ['Resolved', 'Verified', 'Rejected'] },
      deadline: { $lt: new Date() },
    });

    // Average resolution time (in hours) calculated from actual records
    const resolvedDocs = await Report.find({
      resolvedAt: { $ne: null },
      createdAt: { $ne: null },
    }).select('createdAt resolvedAt');

    let avgResolutionHours = 0;
    if (resolvedDocs.length > 0) {
      const totalDurationMs = resolvedDocs.reduce((acc, curr) => {
        const diff = new Date(curr.resolvedAt) - new Date(curr.createdAt);
        return acc + (diff > 0 ? diff : 0);
      }, 0);
      avgResolutionHours = Math.round(
        totalDurationMs / (resolvedDocs.length * 1000 * 60 * 60)
      );
    }

    // Reports by category
    const categoryStats = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Reports by status
    const statusStats = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Reports by priority
    const priorityStats = await Report.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Department-wise metrics
    const departments = await Department.find();
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const totalAssigned = await Report.countDocuments({
          assignedDepartment: dept._id,
        });
        const resolved = await Report.countDocuments({
          assignedDepartment: dept._id,
          status: { $in: ['Resolved', 'Verified'] },
        });
        const overdue = await Report.countDocuments({
          assignedDepartment: dept._id,
          status: { $nin: ['Resolved', 'Verified', 'Rejected'] },
          deadline: { $lt: new Date() },
        });
        const staffCount = await User.countDocuments({
          department: dept._id,
          role: 'staff',
        });

        return {
          id: dept._id,
          name: dept.name,
          code: dept.code,
          totalAssigned,
          resolved,
          overdue,
          staffCount,
          resolutionRate:
            totalAssigned > 0 ? Math.round((resolved / totalAssigned) * 100) : 100,
        };
      })
    );

    // Recent 5 submissions
    const recentSubmissions = await Report.find()
      .populate('reporter', 'name email avatar')
      .populate('assignedDepartment', 'name code')
      .sort('-createdAt')
      .limit(6);

    // High / Critical priority active issues
    const highPriorityIssues = await Report.find({
      priority: { $in: ['High', 'Critical'] },
      status: { $nin: ['Resolved', 'Verified', 'Rejected'] },
    })
      .populate('assignedDepartment', 'name code')
      .populate('assignedStaff', 'name')
      .sort('-createdAt')
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalReports,
        pendingReports,
        inProgressReports,
        resolvedReports,
        rejectedReports,
        overdueReports,
        avgResolutionHours,
        avgResolutionDays: (avgResolutionHours / 24).toFixed(1),
        categoryStats: categoryStats.map((c) => ({
          name: c._id,
          count: c.count,
        })),
        statusStats: statusStats.map((s) => ({
          name: s._id,
          count: s.count,
        })),
        priorityStats: priorityStats.map((p) => ({
          name: p._id,
          count: p.count,
        })),
        departmentStats,
        recentSubmissions,
        highPriorityIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user list for administration
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('department', 'name code')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or department or active status
// @route   PATCH /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { role, department, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role && ['citizen', 'staff', 'admin'].includes(role)) {
      user.role = role;
    }
    if (department !== undefined) {
      user.department = department || null;
    }
    if (isActive !== undefined) {
      user.isActive = !!isActive;
    }

    await user.save();
    const updated = await User.findById(user._id).populate('department');

    res.status(200).json({
      success: true,
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Public / Private
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort('name');
    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/admin/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, contactEmail, contactPhone, slaHours } =
      req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required',
      });
    }

    const dept = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      slaHours: slaHours || 48,
    });

    res.status(201).json({
      success: true,
      department: dept,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PATCH /api/admin/departments/:id
// @access  Private (Admin)
exports.updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      department: dept,
    });
  } catch (error) {
    next(error);
  }
};
