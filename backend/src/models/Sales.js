/**
 * Sales Data Model
 * Validates and normalizes sales transaction data from CSV
 */

class SalesModel {
  /**
   * Normalize and validate a sales record from CSV
   * @param {Object} rawData - Raw data from CSV parser
   * @returns {Object} - Normalized sales record
   */
  static normalize(rawData) {
    return {
      'Transaction ID': this.sanitizeString(rawData['Transaction ID']),
      'Date': this.sanitizeString(rawData['Date']),
      'Customer ID': this.sanitizeString(rawData['Customer ID']),
      'Customer Name': this.sanitizeString(rawData['Customer Name']),
      'Phone Number': this.sanitizeString(rawData['Phone Number']),
      'Gender': this.sanitizeString(rawData['Gender']),
      'Age': this.sanitizeNumber(rawData['Age']),
      'Customer Region': this.sanitizeString(rawData['Customer Region']),
      'Customer Type': this.sanitizeString(rawData['Customer Type']),
      'Product ID': this.sanitizeString(rawData['Product ID']),
      'Product Name': this.sanitizeString(rawData['Product Name']),
      'Brand': this.sanitizeString(rawData['Brand']),
      'Product Category': this.sanitizeString(rawData['Product Category']),
      'Tags': this.sanitizeString(rawData['Tags']),
      'Quantity': this.sanitizeNumber(rawData['Quantity']),
      'Price per Unit': this.sanitizeNumber(rawData['Price per Unit']),
      'Discount Percentage': this.sanitizeNumber(rawData['Discount Percentage']),
      'Total Amount': this.sanitizeNumber(rawData['Total Amount']),
      'Final Amount': this.sanitizeNumber(rawData['Final Amount']),
      'Payment Method': this.sanitizeString(rawData['Payment Method']),
      'Order Status': this.sanitizeString(rawData['Order Status']),
      'Delivery Type': this.sanitizeString(rawData['Delivery Type']),
      'Store ID': this.sanitizeString(rawData['Store ID']),
      'Store Location': this.sanitizeString(rawData['Store Location']),
      'Salesperson ID': this.sanitizeString(rawData['Salesperson ID']),
      'Employee Name': this.sanitizeString(rawData['Employee Name'])
    };
  }

  /**
   * Sanitize string values
   * @param {any} value - Value to sanitize
   * @returns {string} - Sanitized string
   */
  static sanitizeString(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  /**
   * Sanitize number values
   * @param {any} value - Value to sanitize
   * @returns {number} - Sanitized number
   */
  static sanitizeNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Validate required fields
   * @param {Object} data - Sales record to validate
   * @returns {boolean} - True if valid
   */
  static validate(data) {
    const requiredFields = [
      'Transaction ID',
      'Date',
      'Customer ID',
      'Customer Name'
    ];

    return requiredFields.every(field => {
      const value = data[field];
      return value !== null && value !== undefined && String(value).trim() !== '';
    });
  }

  /**
   * Transform data for frontend display
   * Ensures all fields are present and properly formatted
   * @param {Object} data - Sales record
   * @returns {Object} - Transformed record for frontend
   */
  static transformForDisplay(data) {
    const normalized = this.normalize(data);
    
    // Ensure all display fields have default values
    return {
      ...normalized,
      'Transaction ID': normalized['Transaction ID'] || 'N/A',
      'Date': normalized['Date'] || '',
      'Customer ID': normalized['Customer ID'] || 'N/A',
      'Customer Name': normalized['Customer Name'] || 'N/A',
      'Phone Number': normalized['Phone Number'] || '',
      'Gender': normalized['Gender'] || 'N/A',
      'Age': normalized['Age'] || 0,
      'Product Category': normalized['Product Category'] || 'N/A'
    };
  }

  /**
   * Batch normalize multiple records
   * @param {Array} records - Array of raw CSV records
   * @returns {Array} - Array of normalized records
   */
  static normalizeBatch(records) {
    if (!Array.isArray(records)) {
      return [];
    }

    return records
      .map(record => this.normalize(record))
      .filter(record => this.validate(record));
  }
}

module.exports = SalesModel;


