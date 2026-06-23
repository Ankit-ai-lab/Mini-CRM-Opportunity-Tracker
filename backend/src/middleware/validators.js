const { body, validationResult } = require('express-validator');
const { STAGES, PRIORITIES } = require('../models/Opportunity');

// Helper to run after validators and return formatted errors
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  runValidation,
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  runValidation,
];

const createOpportunityValidation = [
  body('customerName').trim().notEmpty().withMessage('Customer / company name is required'),
  body('requirement').trim().notEmpty().withMessage('Requirement summary is required'),
  body('contactEmail')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Contact email must be valid'),
  body('estimatedValue')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Estimated value must be a non-negative number'),
  body('stage').optional().isIn(STAGES).withMessage(`Stage must be one of: ${STAGES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(PRIORITIES)
    .withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  body('nextFollowUpDate').optional({ checkFalsy: true }).isISO8601().toDate(),
  runValidation,
];

const updateOpportunityValidation = [
  body('customerName').optional().trim().notEmpty().withMessage('Customer name cannot be empty'),
  body('requirement').optional().trim().notEmpty().withMessage('Requirement cannot be empty'),
  body('contactEmail')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Contact email must be valid'),
  body('estimatedValue')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Estimated value must be a non-negative number'),
  body('stage').optional().isIn(STAGES).withMessage(`Stage must be one of: ${STAGES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(PRIORITIES)
    .withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  body('nextFollowUpDate').optional({ checkFalsy: true }).isISO8601().toDate(),
  runValidation,
];

module.exports = {
  registerValidation,
  loginValidation,
  createOpportunityValidation,
  updateOpportunityValidation,
};
