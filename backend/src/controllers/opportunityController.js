const Opportunity = require('../models/Opportunity');

// @route   GET /api/opportunities
// @access  Private (all logged-in users see the shared pipeline)
// Supports optional query params: stage, priority, search, sortBy, sortOrder, page, limit
const getOpportunities = async (req, res, next) => {
  try {
    const { stage, priority, search, sortBy, sortOrder, page, limit } = req.query;

    const filter = {};
    if (stage) filter.stage = stage;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { requirement: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
      ];
    }

    const sortField = ['estimatedValue', 'nextFollowUpDate', 'priority', 'createdAt'].includes(
      sortBy
    )
      ? sortBy
      : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter)
        .populate('owner', 'name email')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limitNum),
      Opportunity.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: opportunities.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: opportunities,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/opportunities/:id
// @access  Private
const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      'owner',
      'name email'
    );

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/opportunities
// @access  Private
// Owner is ALWAYS derived from req.user (set by authMiddleware from the verified JWT).
// Any user_id / owner / createdBy field sent in the request body is ignored.
const createOpportunity = async (req, res, next) => {
  try {
    const {
      customerName,
      contactName,
      contactEmail,
      contactPhone,
      requirement,
      estimatedValue,
      stage,
      priority,
      nextFollowUpDate,
      notes,
    } = req.body;

    const opportunity = await Opportunity.create({
      owner: req.user.id, // <-- derived from JWT, never from client input
      customerName,
      contactName,
      contactEmail,
      contactPhone,
      requirement,
      estimatedValue,
      stage,
      priority,
      nextFollowUpDate,
      notes,
    });

    const populated = await opportunity.populate('owner', 'name email');

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/opportunities/:id
// @access  Private (owner only)
const updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    // Backend-enforced ownership check — never rely on the frontend hiding buttons.
    if (opportunity.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this opportunity',
      });
    }

    const allowedFields = [
      'customerName',
      'contactName',
      'contactEmail',
      'contactPhone',
      'requirement',
      'estimatedValue',
      'stage',
      'priority',
      'nextFollowUpDate',
      'notes',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        opportunity[field] = req.body[field];
      }
    });

    await opportunity.save();
    const populated = await opportunity.populate('owner', 'name email');

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/opportunities/:id
// @access  Private (owner only)
const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    if (opportunity.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this opportunity',
      });
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
