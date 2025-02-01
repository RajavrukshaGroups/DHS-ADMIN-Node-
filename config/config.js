const dotenv = require('dotenv');
const mysql = require('mysql2');

// Load environment variables from .env file
dotenv.config();

// Destructure environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

// Log the environment variables to verify they are loaded correctly
console.log('Database configuration:', { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE });

// Create a MySQL pool for better connection management
const conn = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  waitForConnections: true, 
  connectionLimit: 10, // Adjust the maximum number of connections
  queueLimit: 0 // No limit on the number of queued connections
});

// Test the connection pool
conn.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Database connected successfully!');
  connection.release(); // Release the connection back to the pool
});

module.exports = conn;
