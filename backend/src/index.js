const express = require('express');
const cors = require('cors');
const salesRoutes = require('./routes/salesRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sales', salesRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const sqlite3 = require('sqlite3').verbose();

    const dbPath = path.resolve(__dirname, 'sales.db'); // In src/
    const rootCsvPath = path.resolve(__dirname, '../../truestate_assignment_dataset.csv'); // Root

    const info = {
        cwd: process.cwd(),
        dirname: __dirname,
        dbPath: dbPath,
        dbExists: fs.existsSync(dbPath),
        rootCsvPath: rootCsvPath,
        rootCsvExists: fs.existsSync(rootCsvPath),
        srcFiles: fs.readdirSync(__dirname),
    };

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            info.dbConnectionError = err.message;
            return res.json(info);
        }

        db.get("SELECT count(*) as count FROM sales", (err, row) => {
            if (err) {
                info.dbQueryError = err.message;
            } else {
                info.rowCount = row.count;
            }
            res.json(info);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
