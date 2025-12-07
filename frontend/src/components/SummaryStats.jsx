import React from 'react';
import './SummaryStats.css';

const SummaryStats = ({ summary }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="summary-stats">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total units sold</span>
          <span className="stat-info">ℹ️</span>
        </div>
        <div className="stat-value">{summary.totalUnits}</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Amount</span>
          <span className="stat-info">ℹ️</span>
        </div>
        <div className="stat-value">{formatCurrency(summary.totalAmount)}</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Discount</span>
          <span className="stat-info">ℹ️</span>
        </div>
        <div className="stat-value">{formatCurrency(summary.totalDiscount)}</div>
      </div>
    </div>
  );
};

export default SummaryStats;


