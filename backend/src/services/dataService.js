const db = require('./database');
const SalesModel = require('../models/Sales');

let filterOptionsCache = null;
let filterOptionsLoaded = false;

// Check if item matches search criteria
const matchesSearch = (item, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return true;
  }
  const term = searchTerm.toLowerCase().trim();
  const customerName = (item['Customer Name'] || '').toLowerCase();
  const phoneNumber = (item['Phone Number'] || '').toLowerCase();
  return customerName.includes(term) || phoneNumber.includes(term);
};

// Check if item matches filter criteria
const matchesFilters = (item, filters) => {
  // Customer Region filter
  if (filters.regions && filters.regions.length > 0) {
    if (!filters.regions.includes(item['Customer Region'])) {
      return false;
    }
  }

  // Gender filter
  if (filters.genders && filters.genders.length > 0) {
    if (!filters.genders.includes(item['Gender'])) {
      return false;
    }
  }

  // Age Range filter
  if (filters.ageRange && (filters.ageRange.min !== undefined || filters.ageRange.max !== undefined)) {
    const age = parseInt(item['Age']) || 0;
    const min = filters.ageRange.min !== undefined ? filters.ageRange.min : 0;
    const max = filters.ageRange.max !== undefined ? filters.ageRange.max : 999;
    if (age < min || age > max) {
      return false;
    }
  }

  // Product Category filter
  if (filters.categories && filters.categories.length > 0) {
    if (!filters.categories.includes(item['Product Category'])) {
      return false;
    }
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    const itemTags = (item['Tags'] || '').split(',').map(t => t.trim().toLowerCase());
    const hasMatchingTag = filters.tags.some(tag =>
      itemTags.includes(tag.toLowerCase())
    );
    if (!hasMatchingTag) {
      return false;
    }
  }

  // Payment Method filter
  if (filters.paymentMethods && filters.paymentMethods.length > 0) {
    if (!filters.paymentMethods.includes(item['Payment Method'])) {
      return false;
    }
  }

  // Date Range filter
  if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
    const itemDate = new Date(item['Date']);
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      if (itemDate < startDate) {
        return false;
      }
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      if (itemDate > endDate) {
        return false;
      }
    }
  }

  return true;
};

// Stream and process CSV data with filters, search, sort, and pagination
const streamAndProcessData = (searchTerm, filters, sortBy, sortOrder, page, pageSize) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvPath)) {
      reject(new Error(`CSV file not found at: ${csvPath}`));
      return;
    }

    const results = [];
    let totalCount = 0;
    let summary = { totalUnits: 0, totalAmount: 0, totalDiscount: 0 };

    // For sorting, we need to collect all matching items first
    // For pagination without sorting, we can stream directly
    const needsSorting = sortBy && sortBy !== 'none';

    if (needsSorting) {
      // Collect all matching items for sorting
      const allMatches = [];

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (item) => {
          try {
            // Normalize data using Sales model
            const normalizedItem = SalesModel.normalize(item);
            if (matchesSearch(normalizedItem, searchTerm) && matchesFilters(normalizedItem, filters)) {
              allMatches.push(normalizedItem);

              // Calculate summary on the fly - guard numeric parsing
              const quantity = Number.parseInt(item['Quantity']) || 0;
              const finalAmount = Number.parseFloat(item['Final Amount']) || 0;
              const totalAmountRaw = Number.parseFloat(item['Total Amount']);
              const totalAmount = isNaN(totalAmountRaw) ? 0 : totalAmountRaw;
              const discount = totalAmount - finalAmount;
              summary.totalUnits += quantity;
              summary.totalAmount += finalAmount;
              summary.totalDiscount += discount;
            }
          } catch (err) {
            console.error('Error processing CSV row (sorting path):', err, item);
            // continue processing other rows
          }
        })
        .on('end', () => {
          // Sort the results
          allMatches.sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
              case 'date':
                aVal = new Date(a['Date']);
                bVal = new Date(b['Date']);
                return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;

              case 'quantity':
                aVal = parseInt(a['Quantity']) || 0;
                bVal = parseInt(b['Quantity']) || 0;
                return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;

              case 'customerName':
                aVal = (a['Customer Name'] || '').toLowerCase();
                bVal = (b['Customer Name'] || '').toLowerCase();
                if (sortOrder === 'desc') {
                  return bVal.localeCompare(aVal);
                }
                return aVal.localeCompare(bVal);

              default:
                return 0;
            }
          });

          // Apply pagination and transform for display
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginated = allMatches.slice(startIndex, endIndex).map(item =>
            SalesModel.transformForDisplay(item)
          );

          resolve({
            data: paginated,
            pagination: {
              currentPage: page,
              pageSize: pageSize,
              totalItems: allMatches.length,
              totalPages: Math.ceil(allMatches.length / pageSize),
              hasNextPage: endIndex < allMatches.length,
              hasPreviousPage: page > 1
            },
            summary: {
              totalUnits: summary.totalUnits,
              totalAmount: Math.round(summary.totalAmount * 100) / 100,
              totalDiscount: Math.round(summary.totalDiscount * 100) / 100
            }
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    } else {
      // No sorting needed - stream directly with pagination
      // We need to do two passes: one to count and calculate summary, one to get the page
      // But we can optimize by doing it in one pass if we're okay with approximate counts
      let skipped = 0;
      const startIndex = (page - 1) * pageSize;
      let collected = 0;
      let totalMatching = 0;

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (item) => {
          try {
            // Normalize data using Sales model
            const normalizedItem = SalesModel.normalize(item);
            if (matchesSearch(normalizedItem, searchTerm) && matchesFilters(normalizedItem, filters)) {
              totalMatching++;

              // Calculate summary on all matching items (guard numeric values)
              const quantity = Number(normalizedItem['Quantity']) || 0;
              const finalAmount = Number(normalizedItem['Final Amount']) || 0;
              const totalAmount = Number(normalizedItem['Total Amount']) || 0;
              const discount = totalAmount - finalAmount;
              summary.totalUnits += quantity;
              summary.totalAmount += finalAmount;
              summary.totalDiscount += discount;

              // Collect items for current page
              if (skipped < startIndex) {
                skipped++;
              } else if (collected < pageSize) {
                results.push(SalesModel.transformForDisplay(normalizedItem));
                collected++;
              }
            }
          } catch (err) {
            console.error('Error processing CSV row (streaming path):', err, item);
            // continue processing other rows
          }
        })
        .on('end', () => {
          resolve({
            data: results, // Already transformed
            pagination: {
              currentPage: page,
              pageSize: pageSize,
              totalItems: totalMatching,
              totalPages: Math.ceil(totalMatching / pageSize),
              hasNextPage: (startIndex + pageSize) < totalMatching,
              hasPreviousPage: page > 1
            },
            summary: {
              totalUnits: summary.totalUnits,
              totalAmount: Math.round(summary.totalAmount * 100) / 100,
              totalDiscount: Math.round(summary.totalDiscount * 100) / 100
            }
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    }
  });
};

// Get filter options by streaming through file once
const getFilterOptions = () => {
  return new Promise((resolve, reject) => {
    if (filterOptionsLoaded && filterOptionsCache) {
      resolve(filterOptionsCache);
      return;
    }

    if (!fs.existsSync(csvPath)) {
      reject(new Error(`CSV file not found at: ${csvPath}`));
      return;
    }

    console.log('Loading filter options...');
    const regions = new Set();
    const genders = new Set();
    const categories = new Set();
    const paymentMethods = new Set();
    const allTags = new Set();

    // Track only min/max values instead of storing all values
    let minAge = Infinity;
    let maxAge = 0;
    let minDate = null;
    let maxDate = null;

    let rowCount = 0;

    const stream = fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (item) => {
        try {
          rowCount++;
          if (rowCount % 100000 === 0) {
            console.log(`Processing filter options: ${rowCount} rows...`);
          }

          if (item['Customer Region']) regions.add(item['Customer Region']);
          if (item['Gender']) genders.add(item['Gender']);
          if (item['Product Category']) categories.add(item['Product Category']);
          if (item['Payment Method']) paymentMethods.add(item['Payment Method']);

          const tags = (item['Tags'] || '').split(',').map(t => t.trim()).filter(Boolean);
          tags.forEach(tag => allTags.add(tag));

          // Track min/max age without storing all values
          const age = Number.parseInt(item['Age']) || 0;
          if (age > 0) {
            if (age < minAge) minAge = age;
            if (age > maxAge) maxAge = age;
          }

          // Track min/max date without storing all values
          if (item['Date']) {
            const dateStr = item['Date'];
            if (!minDate || dateStr < minDate) minDate = dateStr;
            if (!maxDate || dateStr > maxDate) maxDate = dateStr;
          }
        } catch (err) {
          console.error('Error processing CSV row for filters:', err, item);
        }
      })
      .on('end', () => {
        try {
          filterOptionsCache = {
            regions: [...regions].sort(),
            genders: [...genders].sort(),
            categories: [...categories].sort(),
            tags: [...allTags].sort(),
            paymentMethods: [...paymentMethods].sort(),
            ageRange: {
              min: minAge !== Infinity ? minAge : 0,
              max: maxAge > 0 ? maxAge : 100
            },
            dateRange: {
              min: minDate || '',
              max: maxDate || ''
            }
          };
          filterOptionsLoaded = true;
          console.log(`Filter options loaded successfully (processed ${rowCount} rows)`);
          resolve(filterOptionsCache);
        } catch (error) {
          console.error('Error processing filter options:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error loading filter options:', error);
        reject(error);
      });
  });
};

// Legacy functions for compatibility (now use streaming)
const getAllData = async () => {
  // This is not recommended for large files, but kept for compatibility
  // In practice, we should use streamAndProcessData instead
  const result = await streamAndProcessData('', {}, 'date', 'desc', 1, 1000);
  return result.data;
};

const searchData = (data, searchTerm) => {
  // This function is no longer used with streaming approach
  // Kept for compatibility
  if (!searchTerm || searchTerm.trim() === '') {
    return data;
  }
  const term = searchTerm.toLowerCase().trim();
  return data.filter(item => {
    const customerName = (item['Customer Name'] || '').toLowerCase();
    const phoneNumber = (item['Phone Number'] || '').toLowerCase();
    return customerName.includes(term) || phoneNumber.includes(term);
  });
};

const filterData = (data, filters) => {
  // This function is no longer used with streaming approach
  // Kept for compatibility
  return data.filter(item => matchesFilters(item, filters));
};

const sortData = (data, sortBy, sortOrder = 'asc') => {
  // This function is no longer used with streaming approach
  // Kept for compatibility
  const sorted = [...data];
  sorted.sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'date':
        aVal = new Date(a['Date']);
        bVal = new Date(b['Date']);
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      case 'quantity':
        aVal = parseInt(a['Quantity']) || 0;
        bVal = parseInt(b['Quantity']) || 0;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      case 'customerName':
        aVal = (a['Customer Name'] || '').toLowerCase();
        bVal = (b['Customer Name'] || '').toLowerCase();
        if (sortOrder === 'desc') {
          return bVal.localeCompare(aVal);
        }
        return aVal.localeCompare(bVal);
      default:
        return 0;
    }
  });
  return sorted;
};

const paginateData = (data, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = data.slice(startIndex, endIndex);
  return {
    data: paginated,
    pagination: {
      currentPage: page,
      pageSize: pageSize,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / pageSize),
      hasNextPage: endIndex < data.length,
      hasPreviousPage: page > 1
    }
  };
};

const calculateSummary = (data) => {
  let totalUnits = 0;
  let totalAmount = 0;
  let totalDiscount = 0;
  data.forEach(item => {
    const quantity = parseInt(item['Quantity']) || 0;
    const finalAmount = parseFloat(item['Final Amount']) || 0;
    const discount = parseFloat(item['Total Amount']) - finalAmount;
    totalUnits += quantity;
    totalAmount += finalAmount;
    totalDiscount += discount;
  });
  return {
    totalUnits,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100
  };
};

module.exports = {
  streamAndProcessData,
  getFilterOptions,
  getAllData,
  searchData,
  filterData,
  sortData,
  paginateData,
  calculateSummary
};
