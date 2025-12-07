# Architecture Documentation

## Overview

The Retail Sales Management System is a full-stack web application built with a clear separation between frontend and backend. The system processes large CSV datasets, provides advanced search, filtering, sorting, and pagination capabilities.

## Backend Architecture

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Data Processing**: csv-parser (streaming CSV reader)
- **Architecture Pattern**: MVC (Model-View-Controller)

### Folder Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   │   └── salesController.js
│   ├── services/        # Business logic
│   │   └── dataService.js
│   ├── routes/          # API route definitions
│   │   └── salesRoutes.js
│   ├── utils/           # Utility functions (if needed)
│   ├── models/          # Data models (if needed)
│   └── index.js         # Application entry point
├── package.json
└── README.md
```

### Module Responsibilities

#### `index.js` (Entry Point)

- Initializes Express application
- Configures middleware (CORS, JSON parsing)
- Registers routes
- Starts HTTP server on port 3001

#### `salesRoutes.js` (Routes)

- Defines API endpoints:
  - `GET /api/sales` - Fetch sales data with filters
  - `GET /api/sales/filters` - Get available filter options
- Routes requests to appropriate controllers

#### `salesController.js` (Controllers)

- Handles HTTP requests and responses
- Extracts query parameters (search, filters, sort, pagination)
- Calls service layer for data processing
- Returns formatted JSON responses
- Handles errors and returns appropriate status codes

#### `dataService.js` (Services)

- **Data Loading**: Loads CSV data into memory on first request (cached)
- **Search**: Case-insensitive search on Customer Name and Phone Number
- **Filtering**: Multi-select filtering for:
  - Customer Region
  - Gender
  - Age Range (min/max)
  - Product Category
  - Tags (comma-separated values)
  - Payment Method
  - Date Range (start/end)
- **Sorting**: Sorts by Date, Quantity, or Customer Name (asc/desc)
- **Pagination**: Splits data into pages (default 10 items per page)
- **Summary Calculation**: Computes total units, total amount, and total discount
- **Filter Options**: Extracts unique values for filter dropdowns

### Data Flow

1. **Initial Request**: Client requests `/api/sales/filters`

   - Backend loads CSV (if not already loaded)
   - Extracts unique values for all filter categories
   - Returns filter options to frontend

2. **Data Request**: Client requests `/api/sales` with query parameters

   - Backend receives search term, filters, sort, and pagination params
   - Applies search to full dataset
   - Applies filters sequentially
   - Calculates summary statistics
   - Applies sorting
   - Applies pagination
   - Returns paginated data, summary, and pagination metadata

3. **Caching Strategy**: CSV data is loaded once and kept in memory for subsequent requests, improving performance.

## Frontend Architecture

### Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router (if needed)
- **HTTP Client**: Axios
- **Styling**: CSS Modules / Plain CSS

### Folder Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── SummaryStats.jsx
│   │   ├── SalesTable.jsx
│   │   └── Pagination.jsx
│   ├── pages/           # Page components
│   │   └── SalesManagement.jsx
│   ├── services/        # API communication
│   │   └── api.js
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks (if needed)
│   ├── styles/          # Global styles
│   │   └── index.css
│   ├── App.jsx          # Root component
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

### Component Hierarchy

```
App
└── Layout
    └── SalesManagement
        ├── SearchBar
        ├── FilterPanel
        ├── SummaryStats
        ├── SalesTable
        └── Pagination
```

### Module Responsibilities

#### `main.jsx` (Entry Point)

- Renders React app into DOM
- Applies global styles

#### `App.jsx` (Root Component)

- Wraps application with Layout component
- Renders SalesManagement page

#### `Layout.jsx` (Layout Component)

- Provides sidebar navigation
- Manages navigation state (expanded/collapsed sections)
- Displays user information
- Provides main content area

#### `SalesManagement.jsx` (Main Page)

- **State Management**: Manages all application state:
  - Sales data
  - Filter options
  - Search term
  - Active filters
  - Sort configuration
  - Pagination state
  - Loading/error states
- **Data Fetching**: Uses `useEffect` hooks to:
  - Load filter options on mount
  - Fetch sales data when filters/search/sort/page changes
- **Event Handlers**: Handles user interactions:
  - Search input changes
  - Filter selections
  - Sort changes
  - Page navigation
  - Refresh action

#### `SearchBar.jsx`

- Provides search input field
- Debounces search input (immediate update in current implementation)
- Calls parent's `onSearch` callback

#### `FilterPanel.jsx`

- Renders all filter controls:
  - Multi-select dropdowns for regions, genders, categories, tags, payment methods
  - Number inputs for age range
  - Date inputs for date range
- Handles filter changes and updates parent state

#### `SummaryStats.jsx`

- Displays three summary cards:
  - Total units sold
  - Total amount
  - Total discount
- Formats currency values

#### `SalesTable.jsx`

- Renders sales data in tabular format
- Formats dates and phone numbers
- Displays transaction details

#### `Pagination.jsx`

- Provides Previous/Next navigation
- Displays current page information
- Handles page change events

#### `api.js` (API Service)

- Configures Axios instance with base URL
- Provides methods:
  - `getSalesData(params)` - Fetch sales with filters
  - `getFilterOptions()` - Fetch available filter options
- Handles API communication errors

### Data Flow

1. **Initial Load**:

   - Component mounts → Fetch filter options → Fetch initial sales data (page 1)

2. **User Interaction**:

   - User changes search/filter/sort → State updates → `useEffect` triggers → API call → State updates → UI re-renders

3. **Pagination**:

   - User clicks Next/Previous → Page state updates → `useEffect` triggers → API call with new page → UI updates

4. **State Management**:
   - All state is managed in `SalesManagement` component
   - Child components receive props and callbacks
   - Unidirectional data flow (parent → child)

## Key Design Decisions

### Backend

1. **In-Memory Data Storage**: CSV is loaded into memory for fast access. Suitable for datasets that fit in memory.

2. **Sequential Filtering**: Filters are applied sequentially, which is efficient and maintainable.

3. **Summary Calculation**: Summary is calculated on filtered data (before pagination) to show accurate totals.

4. **Query Parameter Parsing**: Express automatically parses query parameters, including arrays for multi-select filters.

### Frontend

1. **Component-Based Architecture**: Each UI element is a separate, reusable component.

2. **Centralized State**: All state managed in parent component for simplicity and predictability.

3. **Effect-Based Data Fetching**: Uses React's `useEffect` to automatically fetch data when dependencies change.

4. **Responsive Design**: CSS uses flexbox and media queries for responsive layouts.

## Performance Considerations

1. **Backend**:

   - CSV loaded once and cached in memory
   - Filtering and sorting done in-memory (fast for reasonable dataset sizes)
   - Pagination reduces response size

2. **Frontend**:
   - Components only re-render when their props/state change
   - Search updates immediately (could be debounced for very large datasets)
   - Pagination limits rendered rows

## Error Handling

1. **Backend**:

   - Try-catch blocks in controllers
   - Returns error responses with appropriate status codes
   - Logs errors to console

2. **Frontend**:
   - Error state in component
   - Displays error messages to user
   - Handles empty results gracefully

## Future Enhancements

1. **Backend**:

   - Database integration for larger datasets
   - Caching layer (Redis)
   - API rate limiting
   - Input validation middleware

2. **Frontend**:
   - Debounced search input
   - Loading skeletons
   - Error boundaries
   - Optimistic UI updates
   - Virtual scrolling for large tables

