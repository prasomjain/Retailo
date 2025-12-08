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

app.get('/api/debug', (req, res) => {
  const fs = require('fs');
  const path = require('path');

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
    parentFiles: fs.existsSync(path.resolve(__dirname, '../')) ? fs.readdirSync(path.resolve(__dirname, '../')) : 'cannot read parent'
  };

  res.json(info);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


