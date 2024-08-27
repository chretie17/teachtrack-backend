const db = require('../db/db');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const JWT_SECRET = '78446288c49491e01f792fb8f5eb5efd22308d601b42d6c101894e9b4797f89806e635e452253e83effaf3c44c49c222213768975058f21d1ddcff14726db8f0'; // Replace with a secure key

// Register User
exports.register = (req, res) => {
  const { username, password, role } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';

    db.query(query, [username, hashedPassword, role], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(201).json({ id: result.insertId, username, role });
    });
  });
};

// Login User
exports.login = (req, res) => {
    const { identifier, password } = req.body;
  
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
  
    db.query(query, [identifier, identifier], (err, rows) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const user = rows[0];
  
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
  
        const token = jwt.sign(
          { id: user.id, role: user.role }, 
          JWT_SECRET, 
          { expiresIn: '12h' }
        );
  
        res.json({ token, role: user.role, id: user.id });
      });
    });
  };