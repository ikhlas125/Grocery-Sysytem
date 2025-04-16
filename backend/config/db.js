// config/db.js
require('dotenv').config();
const sql = require('mssql');

// Validate environment variables
if (!process.env.DB_SERVER || !process.env.DB_NAME) {
  console.error('❌ Missing database configuration in .env file');
  process.exit(1);
}

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // For local connections
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

console.log('🔧 Database Config:', {
  server: dbConfig.server,
  database: dbConfig.database,
  user: dbConfig.user
});

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });

module.exports = { sql, poolPromise };