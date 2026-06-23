const mongoose = require('mongoose');

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const opportunitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer / company name is required'],
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    requirement: {
      type: String,
      required: [true, 'Requirement / need summary is required'],
      trim: true,
    },
    estimatedValue: {
      type: Number,
      min: [0, 'Estimated value cannot be negative'],
      default: 0,
    },
    stage: {
      type: String,
      enum: STAGES,
      default: 'New',
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'Medium',
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

opportunitySchema.index({ stage: 1 });
opportunitySchema.index({ priority: 1 });
opportunitySchema.index({ owner: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
module.exports.STAGES = STAGES;
module.exports.PRIORITIES = PRIORITIES;
