// db/db.js
const mysql = require('mysql2'); // Using callback-based MySQL connection

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Admin@123',
  database: 'teachtrack'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database successfully.');
  }
});

module.exports = connection;
