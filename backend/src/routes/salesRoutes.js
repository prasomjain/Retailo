const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Get sales data with filters, search, sort, and pagination
router.get('/', salesController.getSalesData);

// Get filter options
router.get('/filters', salesController.getFilterOptions);

module.exports = router;


