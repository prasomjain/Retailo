import React, { useState, useRef, useEffect } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filterOptions, filters, onFilterChange }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown) {
        const ref = dropdownRefs.current[openDropdown];
        if (ref && !ref.contains(event.target)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  if (!filterOptions) {
    return <div>Loading filters...</div>;
  }

  const toggleDropdown = (filterType) => {
    setOpenDropdown(openDropdown === filterType ? null : filterType);
  };

  const handleMultiSelect = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const isSelected = currentValues.includes(value);

    if (isSelected) {
      onFilterChange(filterType, currentValues.filter(v => v !== value));
    } else {
      onFilterChange(filterType, [...currentValues, value]);
    }
  };

  const handleAgeRange = (type, value) => {
    onFilterChange('ageRange', {
      ...filters.ageRange,
      [type]: value ? parseInt(value) : ''
    });
  };

  const handleDateRange = (type, value) => {
    onFilterChange('dateRange', {
      ...filters.dateRange,
      [type]: value
    });
  };

  const getSelectedCount = (filterType) => {
    const values = filters[filterType] || [];
    return values.length;
  };

  const getDisplayText = (filterType) => {
    const values = filters[filterType] || [];
    if (values.length === 0) return 'All';
    if (values.length === 1) return values[0];
    return `${values.length} selected`;
  };

  const DropdownSelect = ({ filterType, label, options, isOpen, onToggle }) => {
    const selectedValues = filters[filterType] || [];

    return (
      <div
        className="filter-dropdown-wrapper"
        ref={(el) => (dropdownRefs.current[filterType] = el)}
      >
        <div className="filter-dropdown-header" onClick={onToggle}>
          <div>
            <div className="filter-label">{label}</div>
            <div className="filter-selected-text">{getDisplayText(filterType)}</div>
          </div>
          <span className={`dropdown-chevron ${isOpen ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen && (
          <div className="filter-dropdown-menu">
            {options.map(option => {
              const isSelected = selectedValues.includes(option);
              return (
                <div
                  key={option}
                  className={`filter-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleMultiSelect(filterType, option)}
                >
                  <span className="checkbox">
                    {isSelected && '✓'}
                  </span>
                  <span>{option}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="filter-panel">
      <DropdownSelect
        filterType="regions"
        label="CUSTOMER REGION"
        options={filterOptions.regions || []}
        isOpen={openDropdown === 'regions'}
        onToggle={() => toggleDropdown('regions')}
      />

      <DropdownSelect
        filterType="genders"
        label="GENDER"
        options={filterOptions.genders || []}
        isOpen={openDropdown === 'genders'}
        onToggle={() => toggleDropdown('genders')}
      />

      <div className="filter-dropdown-wrapper">
        <div className="filter-dropdown-header">
          <div>
            <div className="filter-label">AGE RANGE</div>
            <div className="filter-selected-text">
              {filters.ageRange?.min || filters.ageRange?.max
                ? `${filters.ageRange.min || 'Min'} to ${filters.ageRange.max || 'Max'}`
                : 'All'}
            </div>
          </div>
        </div>
        <div className="age-range-inputs">
          <input
            type="number"
            placeholder="Min"
            min={filterOptions.ageRange?.min}
            max={filterOptions.ageRange?.max}
            value={filters.ageRange?.min || ''}
            onChange={(e) => handleAgeRange('min', e.target.value)}
            className="age-input"
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            min={filterOptions.ageRange?.min}
            max={filterOptions.ageRange?.max}
            value={filters.ageRange?.max || ''}
            onChange={(e) => handleAgeRange('max', e.target.value)}
            className="age-input"
          />
        </div>
      </div>

      <DropdownSelect
        filterType="categories"
        label="PRODUCT CATEGORY"
        options={filterOptions.categories || []}
        isOpen={openDropdown === 'categories'}
        onToggle={() => toggleDropdown('categories')}
      />

      <DropdownSelect
        filterType="tags"
        label="TAGS"
        options={filterOptions.tags || []}
        isOpen={openDropdown === 'tags'}
        onToggle={() => toggleDropdown('tags')}
      />

      <DropdownSelect
        filterType="paymentMethods"
        label="PAYMENT METHOD"
        options={filterOptions.paymentMethods || []}
        isOpen={openDropdown === 'paymentMethods'}
        onToggle={() => toggleDropdown('paymentMethods')}
      />

      <div className="filter-dropdown-wrapper">
        <div className="filter-dropdown-header">
          <div>
            <div className="filter-label">DATE</div>
            <div className="filter-selected-text">
              {filters.dateRange?.start || filters.dateRange?.end
                ? `${filters.dateRange.start || 'Start'} to ${filters.dateRange.end || 'End'}`
                : 'All'}
            </div>
          </div>
        </div>
        <div className="date-range-inputs">
          <input
            type="date"
            min={filterOptions.dateRange?.min}
            max={filterOptions.dateRange?.max}
            value={filters.dateRange?.start || ''}
            onChange={(e) => handleDateRange('start', e.target.value)}
            className="date-input"
          />
          <span>to</span>
          <input
            type="date"
            min={filterOptions.dateRange?.min}
            max={filterOptions.dateRange?.max}
            value={filters.dateRange?.end || ''}
            onChange={(e) => handleDateRange('end', e.target.value)}
            className="date-input"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
