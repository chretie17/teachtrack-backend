const db = require('../db/db');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
  
      // Validate input
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // SQL query to insert a new user
      const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  
      // Execute the query using the db connection
      db.query(query, [username, email, hashedPassword, role], (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        res.status(201).json({ id: result.insertId, username, email, role });
      });
    } catch (error) {
      console.error('Error during user creation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Get Users
exports.getUsers = (req, res) => {
  try {
    const query = 'SELECT id, username, email, role, created_at, updated_at FROM users';

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(results);
    });
  } catch (error) {
    console.error('Error during fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update User
exports.updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    const query = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?';

    db.query(query, [username, email, role, id], (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated successfully' });
    });
  } catch (error) {
    console.error('Error during updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete User
exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM users WHERE id = ?';

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    });
  } catch (error) {
    console.error('Error during deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
