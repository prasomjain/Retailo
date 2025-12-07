import React, { useState, useEffect, useCallback } from 'react';
import { salesAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import SummaryStats from '../components/SummaryStats';
import SalesTable from '../components/SalesTable';
import Pagination from '../components/Pagination';
import './SalesManagement.css';

const SalesManagement = () => {
  const [salesData, setSalesData] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [summary, setSummary] = useState({ totalUnits: 0, totalAmount: 0, totalDiscount: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters, search, and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    regions: [],
    genders: [],
    ageRange: { min: '', max: '' },
    categories: [],
    tags: [],
    paymentMethods: [],
    dateRange: { start: '', end: '' }
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await salesAPI.getFilterOptions();
        if (response.success) {
          setFilterOptions(response.data);
        }
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    loadFilterOptions();
  }, []);

  // Fetch sales data
  const fetchSalesData = useCallback(async () => {
    console.log('Fetching sales data...');
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filters.regions.length > 0) {
        params.regions = filters.regions;
      }
      if (filters.genders.length > 0) {
        params.genders = filters.genders;
      }
      if (filters.ageRange.min) {
        params.ageMin = filters.ageRange.min;
      }
      if (filters.ageRange.max) {
        params.ageMax = filters.ageRange.max;
      }
      if (filters.categories.length > 0) {
        params.categories = filters.categories;
      }
      if (filters.tags.length > 0) {
        params.tags = filters.tags;
      }
      if (filters.paymentMethods.length > 0) {
        params.paymentMethods = filters.paymentMethods;
      }
      if (filters.dateRange.start) {
        params.dateStart = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        params.dateEnd = filters.dateRange.end;
      }

      const response = await salesAPI.getSalesData(params);

      if (response.success) {
        console.log('Sales data fetched successfully:', response.data);
        console.log('Summary:', response.summary);
        console.log('Pagination:', response.pagination);
        setSalesData(response.data);
        setSummary(response.summary);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError('Failed to load sales data. Please try again.');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
      console.log('Fetch operation completed');
    }
  }, [searchTerm, filters, sortBy, sortOrder, pagination.currentPage, pagination.pageSize]);

  // Fetch data when filters, search, sort, or page changes
  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Reset to page 1 when filters/search/sort change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filters, sortBy, sortOrder]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleRefresh = () => {
    fetchSalesData();
  };

  return (
    <div className="sales-management">
      <div className="sales-header">
        <h1>Sales Management System</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <FilterPanel
            filterOptions={filterOptions}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <div className="sort-refresh">
            <button className="refresh-btn" onClick={handleRefresh} title="Refresh">
              🔄
            </button>
            <select
              className="sort-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="quantity-desc">Quantity (High to Low)</option>
              <option value="quantity-asc">Quantity (Low to High)</option>
              <option value="customerName-asc">Customer Name (A-Z)</option>
              <option value="customerName-desc">Customer Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      <SummaryStats summary={summary} />

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : salesData.length === 0 ? (
        <div className="no-results">No sales data found matching your criteria.</div>
      ) : (
        <>
          <SalesTable data={salesData} />
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default SalesManagement;


