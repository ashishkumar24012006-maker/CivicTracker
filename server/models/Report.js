const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    byName: {
      type: String,
      default: 'System',
    },
    role: {
      type: String,
      default: 'system',
    },
    note: {
      type: String,
      default: '',
    },
    fromStatus: {
      type: String,
      default: null,
    },
    toStatus: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed issue description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Pothole & Roads',
        'Streetlight',
        'Water Supply & Leakage',
        'Garbage & Sanitation',
        'Drainage & Sewage',
        'Traffic & Signals',
        'Public Parks',
        'Other',
      ],
      default: 'Other',
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Verified',
        'Rejected',
        'Reopened',
      ],
      default: 'Submitted',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required [longitude, latitude]'],
      },
    },
    address: {
      type: String,
      required: [true, 'Please provide a location address or landmark'],
      trim: true,
    },
    locality: {
      type: String,
      default: '',
    },
    landmark: {
      type: String,
      default: '',
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    resolutionEvidence: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        note: { type: String, default: '' },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    resolutionNote: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectedReason: {
      type: String,
      default: '',
    },
    reopenReason: {
      type: String,
      default: '',
    },
    citizenFeedback: {
      confirmed: { type: Boolean, default: null },
      comments: { type: String, default: '' },
      rating: { type: Number, min: 1, max: 5, default: null },
      submittedAt: { type: Date, default: null },
    },
    activityLogs: [activityLogSchema],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// GeoJSON 2dsphere index for location queries
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ assignedDepartment: 1 });
reportSchema.index({ assignedStaff: 1 });
reportSchema.index({ createdAt: -1 });

// Virtual to determine if issue is overdue
reportSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Resolved' || this.status === 'Verified' || this.status === 'Rejected') {
    return false;
  }
  if (!this.deadline) return false;
  return new Date() > new Date(this.deadline);
});

module.exports = mongoose.model('Report', reportSchema);
