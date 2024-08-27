const pool = require('../db/db');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const JWT_SECRET = '78446288c49491e01f792fb8f5eb5efd22308d601b42d6c101894e9b4797f89806e635e452253e83effaf3c44c49c222213768975058f21d1ddcff14726db8f0'; // Replace with a secure key

exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );
    res.status(201).json({ id: result.insertId, username, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
    const { identifier, password } = req.body;
    
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ? OR email = ?', 
        [identifier, identifier]
      );
  
      if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
  
      const user = rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
  
      if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
  
      const token = jwt.sign(
        { id: user.id, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '12h' }
      );
  
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };