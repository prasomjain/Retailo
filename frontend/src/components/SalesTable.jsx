import React from 'react';
import './SalesTable.css';

const SalesTable = ({ data }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.startsWith('+') ? phone : `+91 ${phone}`;
  };

  return (
    <div className="sales-table-container">
      <table className="sales-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Customer ID</th>
            <th>Customer name</th>
            <th>Phone Number</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Product Category</th>
            <th>Payment Method</th>
            <th>Order Status</th>
            <th>Delivery Type</th>
            <th>Store ID</th>
            <th>Store Location</th>
            <th>Salesperson ID</th>
            <th>Employee Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={`${row['Transaction ID']}-${index}`}>
              <td>{row['Transaction ID']}</td>
              <td>{formatDate(row['Date'])}</td>
              <td>{row['Customer ID']}</td>
              <td>{row['Customer Name']}</td>
              <td>
                <span className="phone-cell">
                  <span className="phone-icon">📞</span>
                  {formatPhone(row['Phone Number'])}
                </span>
              </td>
              <td>{row['Gender']}</td>
              <td>{row['Age']}</td>
              <td>{row['Product Category']}</td>
              <td>{row['Payment Method'] || 'N/A'}</td>
              <td>
                <span className={`status-badge status-${(row['Order Status'] || '').toLowerCase()}`}>
                  {row['Order Status'] || 'N/A'}
                </span>
              </td>
              <td>{row['Delivery Type'] || 'N/A'}</td>
              <td>{row['Store ID'] || 'N/A'}</td>
              <td>{row['Store Location'] || 'N/A'}</td>
              <td>{row['Salesperson ID'] || 'N/A'}</td>
              <td>{row['Employee Name'] || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;

