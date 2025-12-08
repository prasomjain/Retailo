const db = require('./database');
const SalesModel = require('../models/Sales');

// Process data using SQL queries
const streamAndProcessData = (searchTerm, filters, sortBy, sortOrder, page, pageSize) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM sales WHERE 1=1`;
    // For counting, we can't easily do "SELECT COUNT(*) ... GROUP BY" if we have complex filters, 
    // but here we are filtering, so COUNT(*) on the WHERE clause is correct.
    let countQuery = `SELECT COUNT(*) as total FROM sales WHERE 1=1`;
    const params = [];

    // Search
    if (searchTerm) {
      const searchClause = ` AND ("Customer Name" LIKE ? OR "Phone Number" LIKE ?)`;
      query += searchClause;
      countQuery += searchClause;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Filters
    if (filters) {
      if (filters.regions && filters.regions.length > 0) {
        const placeholders = filters.regions.map(() => '?').join(',');
        const clause = ` AND "Customer Region" IN (${placeholders})`;
        query += clause;
        countQuery += clause;
        params.push(...filters.regions);
      }

      if (filters.genders && filters.genders.length > 0) {
        const placeholders = filters.genders.map(() => '?').join(',');
        const clause = ` AND "Gender" IN (${placeholders})`;
        query += clause;
        countQuery += clause;
        params.push(...filters.genders);
      }

      if (filters.categories && filters.categories.length > 0) {
        const placeholders = filters.categories.map(() => '?').join(',');
        const clause = ` AND "Product Category" IN (${placeholders})`;
        query += clause;
        countQuery += clause;
        params.push(...filters.categories);
      }

      if (filters.tags && filters.tags.length > 0) {
        const placeholders = filters.tags.map(() => '?').join(',');
        const clause = ` AND "Tags" IN (${placeholders})`;
        query += clause;
        countQuery += clause;
        params.push(...filters.tags);
      }

      if (filters.paymentMethods && filters.paymentMethods.length > 0) {
        const placeholders = filters.paymentMethods.map(() => '?').join(',');
        const clause = ` AND "Payment Method" IN (${placeholders})`;
        query += clause;
        countQuery += clause;
        params.push(...filters.paymentMethods);
      }

      if (filters.ageRange) {
        if (filters.ageRange.min) {
          query += ` AND "Age" >= ?`;
          countQuery += ` AND "Age" >= ?`;
          params.push(filters.ageRange.min);
        }
        if (filters.ageRange.max) {
          query += ` AND "Age" <= ?`;
          countQuery += ` AND "Age" <= ?`;
          params.push(filters.ageRange.max);
        }
      }

      if (filters.dateRange) {
        if (filters.dateRange.start) {
          query += ` AND "Date" >= ?`;
          countQuery += ` AND "Date" >= ?`;
          params.push(filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          query += ` AND "Date" <= ?`;
          countQuery += ` AND "Date" <= ?`;
          params.push(filters.dateRange.end);
        }
      }
    }

    // Execute Count Query first
    db.get(countQuery, params, (err, row) => {
      if (err) return reject(err);

      const totalItems = row ? row.total : 0;
      const totalPages = Math.ceil(totalItems / pageSize);
      const safePage = Math.max(1, Math.min(page, totalPages || 1));
      const offset = (safePage - 1) * pageSize;

      // Summary Statistics 
      const statsQuery = countQuery
        .replace('SELECT COUNT(*) as total', 'SELECT SUM("Quantity") as totalUnits, SUM("Total Amount") as totalAmount, SUM("Discount Percentage" * "Total Amount" / 100) as totalDiscount');

      db.get(statsQuery, params, (err, stats) => {
        if (err) {
          // If stats fail, don't crash, just valid zero stats
          console.error("Stats query failed", err);
        }

        // Sorting
        if (sortBy) {
          const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
          switch (sortBy) {
            case 'date': query += ` ORDER BY "Date" ${order}`; break;
            case 'quantity': query += ` ORDER BY "Quantity" ${order}`; break;
            case 'customerName': query += ` ORDER BY "Customer Name" ${order}`; break;
            default: query += ` ORDER BY "Date" DESC`;
          }
        } else {
          query += ` ORDER BY "Date" DESC`;
        }

        // Pagination
        query += ` LIMIT ? OFFSET ?`;
        const queryParams = [...params, pageSize, offset];

        // Execute Data Query
        db.all(query, queryParams, (err, rows) => {
          if (err) return reject(err);

          // We don't need deep transformation if the DB columns match, 
          // but SalesModel.transformForDisplay ensures consistent formatting.
          const paginatedData = rows.map(item => SalesModel.transformForDisplay(item));

          resolve({
            data: paginatedData,
            pagination: {
              currentPage: safePage,
              totalPages: totalPages,
              pageSize: pageSize,
              totalItems: totalItems,
              hasNextPage: safePage < totalPages,
              hasPreviousPage: safePage > 1
            },
            summary: {
              totalItems: totalItems,
              totalUnits: stats?.totalUnits || 0,
              totalAmount: stats?.totalAmount || 0,
              totalDiscount: stats?.totalDiscount || 0
            }
          });
        });
      });
    });
  });
};

const getFilterOptions = () => {
  return new Promise((resolve, reject) => {
    const queries = {
      regions: `SELECT DISTINCT "Customer Region" as value FROM sales ORDER BY value`,
      genders: `SELECT DISTINCT "Gender" as value FROM sales ORDER BY value`,
      categories: `SELECT DISTINCT "Product Category" as value FROM sales ORDER BY value`,
      tags: `SELECT DISTINCT "Tags" as value FROM sales ORDER BY value`, // This might split tags poorly if they are comma-separated in DB, but for MVP it's one tag per row usually or we accept it.
      paymentMethods: `SELECT DISTINCT "Payment Method" as value FROM sales ORDER BY value`,
      ageStats: `SELECT MIN("Age") as min, MAX("Age") as max FROM sales`,
      dateStats: `SELECT MIN("Date") as min, MAX("Date") as max FROM sales`
    };

    const results = {};
    const keys = Object.keys(queries);
    let pending = keys.length;

    if (pending === 0) resolve({});

    keys.forEach(key => {
      db.all(queries[key], [], (err, rows) => {
        if (err) {
          // Fail gracefully?
          console.error(`Error fetching ${key}`, err);
          results[key] = [];
        } else {
          if (key === 'ageStats' || key === 'dateStats') {
            results[key] = rows[0];
          } else {
            results[key] = rows.map(r => r.value).filter(v => v); // Filter nulls
          }
        }

        pending--;
        if (pending === 0) {
          // Resolve final structure
          resolve({
            regions: results.regions || [],
            genders: results.genders || [],
            categories: results.categories || [],
            tags: results.tags || [], // You might need a more complex query to split tags if they are CSV strings
            paymentMethods: results.paymentMethods || [],
            ageRange: { min: results.ageStats?.min || 0, max: results.ageStats?.max || 100 },
            dateRange: { min: results.dateStats?.min || '', max: results.dateStats?.max || '' }
          });
        }
      });
    });
  });
};

module.exports = {
  streamAndProcessData,
  getFilterOptions
};
