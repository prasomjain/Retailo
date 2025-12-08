const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const dbPath = path.resolve(__dirname, '../sales.db');
const csvPath = path.resolve(__dirname, '../../truestate_assignment_dataset.csv');

console.log('Database Path:', dbPath); // Debug log
console.log('CSV Path:', csvPath);     // Debug log

// Create/Open Database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database at', dbPath);
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Determine if table exists
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='sales'", (err, row) => {
            if (err) {
                console.error('Error checking table existence:', err);
                return;
            }

            if (!row) {
                console.log('Table "sales" does not exist. Creating and importing data...');
                createTableAndImport();
            } else {
                console.log('Table "sales" already exists. Skipping import.');
            }
        });
    });
}

function createTableAndImport() {
    const checkTableQuery = `
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      "Transaction ID" TEXT,
      "Date" TEXT,
      "Customer ID" TEXT,
      "Customer Name" TEXT,
      "Phone Number" TEXT,
      "Gender" TEXT,
      "Age" INTEGER,
      "Customer Region" TEXT,
      "Customer Type" TEXT,
      "Product ID" TEXT,
      "Product Name" TEXT,
      "Brand" TEXT,
      "Product Category" TEXT,
      "Tags" TEXT,
      "Quantity" INTEGER,
      "Price per Unit" REAL,
      "Discount Percentage" REAL,
      "Total Amount" REAL,
      "Final Amount" REAL,
      "Payment Method" TEXT,
      "Order Status" TEXT,
      "Delivery Type" TEXT,
      "Store ID" TEXT,
      "Store Location" TEXT,
      "Salesperson ID" TEXT,
      "Employee Name" TEXT
    )
  `;

    db.run(checkTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }
        console.log('Table created. Starting CSV import...');
        importCsv();
    });
}

function importCsv() {
    const results = [];
    let count = 0;

    // Use a transaction for faster inserts
    db.run('BEGIN TRANSACTION');

    const stmt = db.prepare(`INSERT INTO sales (
    "Transaction ID", "Date", "Customer ID", "Customer Name", "Phone Number", 
    "Gender", "Age", "Customer Region", "Customer Type", "Product ID", "Product Name", 
    "Brand", "Product Category", "Tags", "Quantity", "Price per Unit", 
    "Discount Percentage", "Total Amount", "Final Amount", "Payment Method", 
    "Order Status", "Delivery Type", "Store ID", "Store Location", "Salesperson ID", "Employee Name"
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
            stmt.run([
                data['Transaction ID'], data['Date'], data['Customer ID'], data['Customer Name'], data['Phone Number'],
                data['Gender'], parseInt(data['Age']) || 0, data['Customer Region'], data['Customer Type'], data['Product ID'], data['Product Name'],
                data['Brand'], data['Product Category'], data['Tags'], parseInt(data['Quantity']) || 0, parseFloat(data['Price per Unit']) || 0,
                parseFloat(data['Discount Percentage']) || 0, parseFloat(data['Total Amount']) || 0, parseFloat(data['Final Amount']) || 0, data['Payment Method'],
                data['Order Status'], data['Delivery Type'], data['Store ID'], data['Store Location'], data['Salesperson ID'], data['Employee Name']
            ]);
            count++;
            if (count % 10000 === 0) {
                console.log(`Imported ${count} rows...`);
            }
        })
        .on('end', () => {
            stmt.finalize();
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Transaction commit error:', err);
                } else {
                    console.log(`CSV Import completed. Total rows: ${count}`);
                }
            });
        })
        .on('error', (err) => {
            console.error('CSV Read Error:', err);
            db.run('ROLLBACK');
        });
}

module.exports = db;
