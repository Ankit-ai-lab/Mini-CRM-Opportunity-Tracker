const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');
const {
  createOpportunityValidation,
  updateOpportunityValidation,
} = require('../middleware/validators');

// All opportunity routes require authentication
router.use(protect);

router.route('/').get(getOpportunities).post(createOpportunityValidation, createOpportunity);

router
  .route('/:id')
  .get(getOpportunityById)
  .put(updateOpportunityValidation, updateOpportunity)
  .delete(deleteOpportunity);

module.exports = router;
