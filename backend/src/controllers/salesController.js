const dataService = require('../services/dataService');

// Get sales data with search, filter, sort, and pagination (using streaming)
const getSalesData = async (req, res) => {
  try {
    // Parse query parameters
    const searchTerm = req.query.search || '';
    const sortBy = req.query.sortBy || 'date';
    const sortOrder = req.query.sortOrder || 'desc';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Build filters object
    const filters = {};
    if (req.query.regions) {
      filters.regions = Array.isArray(req.query.regions) 
        ? req.query.regions 
        : [req.query.regions];
    }
    if (req.query.genders) {
      filters.genders = Array.isArray(req.query.genders) 
        ? req.query.genders 
        : [req.query.genders];
    }
    if (req.query.ageMin || req.query.ageMax) {
      filters.ageRange = {
        min: req.query.ageMin ? parseInt(req.query.ageMin) : undefined,
        max: req.query.ageMax ? parseInt(req.query.ageMax) : undefined
      };
    }
    if (req.query.categories) {
      filters.categories = Array.isArray(req.query.categories) 
        ? req.query.categories 
        : [req.query.categories];
    }
    if (req.query.tags) {
      filters.tags = Array.isArray(req.query.tags) 
        ? req.query.tags 
        : [req.query.tags];
    }
    if (req.query.paymentMethods) {
      filters.paymentMethods = Array.isArray(req.query.paymentMethods) 
        ? req.query.paymentMethods 
        : [req.query.paymentMethods];
    }
    if (req.query.dateStart || req.query.dateEnd) {
      filters.dateRange = {
        start: req.query.dateStart || undefined,
        end: req.query.dateEnd || undefined
      };
    }

    // Use streaming approach to process data
    const result = await dataService.streamAndProcessData(
      searchTerm,
      filters,
      sortBy,
      sortOrder,
      page,
      pageSize
    );

    // Ensure data is an array
    const data = Array.isArray(result.data) ? result.data : [];

    console.log(`Returning ${data.length} records for page ${page}`);

    res.json({
      success: true,
      data: data,
      pagination: result.pagination || {
        currentPage: page,
        pageSize: pageSize,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      },
      summary: result.summary || {
        totalUnits: 0,
        totalAmount: 0,
        totalDiscount: 0
      }
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales data',
      error: error.message
    });
  }
};

// Get filter options
const getFilterOptions = async (req, res) => {
  try {
    const options = await dataService.getFilterOptions();
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching filter options',
      error: error.message
    });
  }
};

module.exports = {
  getSalesData,
  getFilterOptions
};
