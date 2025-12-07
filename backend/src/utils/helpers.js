// Utility helper functions

/**
 * Format currency value to Indian Rupees
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format date string to readable format
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

/**
 * Format phone number with country code
 */
const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.startsWith('+') ? phone : `+91 ${phone}`;
};

/**
 * Validate and parse query parameters
 */
const parseQueryParams = (query) => {
  const params = {};
  
  // Handle array parameters
  if (query.regions) {
    params.regions = Array.isArray(query.regions) ? query.regions : [query.regions];
  }
  if (query.genders) {
    params.genders = Array.isArray(query.genders) ? query.genders : [query.genders];
  }
  if (query.categories) {
    params.categories = Array.isArray(query.categories) ? query.categories : [query.categories];
  }
  if (query.tags) {
    params.tags = Array.isArray(query.tags) ? query.tags : [query.tags];
  }
  if (query.paymentMethods) {
    params.paymentMethods = Array.isArray(query.paymentMethods) ? query.paymentMethods : [query.paymentMethods];
  }
  
  return params;
};

module.exports = {
  formatCurrency,
  formatDate,
  formatPhone,
  parseQueryParams
};


