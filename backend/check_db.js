const db = require('./src/services/database');

setTimeout(() => {
    db.get("SELECT COUNT(*) as count FROM sales", (err, row) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('Total rows in sales table:', row.count);
        }
        process.exit();
    });
}, 2000); // Wait for connection
