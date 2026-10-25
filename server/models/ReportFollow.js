const mongoose = require('mongoose');

const reportFollowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate follows
reportFollowSchema.index({ user: 1, report: 1 }, { unique: true });

module.exports = mongoose.model('ReportFollow', reportFollowSchema);
