# Retail Sales Management System - Backend

## Overview

Backend API server for the Retail Sales Management System built with Express.js. Handles CSV data processing, search, filtering, sorting, and pagination.

## Tech Stack

- Node.js
- Express.js
- csv-parser

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Ensure the CSV file `truestate_assignment_dataset.csv` is in the root directory (one level up from backend/)

3. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### GET /api/sales

Get sales data with search, filters, sorting, and pagination.

**Query Parameters:**

- `search`: Search term for customer name or phone number
- `regions`: Comma-separated or array of customer regions
- `genders`: Comma-separated or array of genders
- `ageMin`: Minimum age
- `ageMax`: Maximum age
- `categories`: Comma-separated or array of product categories
- `tags`: Comma-separated or array of tags
- `paymentMethods`: Comma-separated or array of payment methods
- `dateStart`: Start date (YYYY-MM-DD)
- `dateEnd`: End date (YYYY-MM-DD)
- `sortBy`: Sort field (date, quantity, customerName)
- `sortOrder`: Sort order (asc, desc)
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10)

### GET /api/sales/filters

Get available filter options (regions, genders, categories, tags, payment methods, age range, date range).

