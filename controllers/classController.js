// controllers/classesController.js
const db = require('../db/db');

// Create Class
exports.createClass = (req, res) => {
  try {
    const { course_code, course_name, course_credit, semester, day_of_week, start_time, end_time, teacher_id } = req.body;

    const query = 'INSERT INTO classes (course_code, course_name, course_credit, semester, day_of_week, start_time, end_time, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [course_code, course_name, course_credit, semester, day_of_week, start_time, end_time, teacher_id], (err, result) => {
      if (err) {
        console.error('Error creating class:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(201).json({ id: result.insertId, course_code, course_name, course_credit, semester, day_of_week, start_time, end_time, teacher_id });
    });
  } catch (error) {
    console.error('Error during class creation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Read Classes
exports.getClasses = (req, res) => {
  try {
    const query = `
      SELECT c.*, u.username AS teacher_name 
      FROM classes c 
      JOIN users u ON c.teacher_id = u.id
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching classes:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update Class
exports.updateClass = (req, res) => {
  try {
    const { id } = req.params;
    const { course_code, course_name, course_credit, semester, day_of_week, start_time, end_time, teacher_id } = req.body;

    const query = `
      UPDATE classes 
      SET course_code = ?, course_name = ?, course_credit = ?, semester = ?, day_of_week = ?, start_time = ?, end_time = ?, teacher_id = ?
      WHERE id = ?
    `;

    db.query(query, [course_code, course_name, course_credit, semester, day_of_week, start_time, end_time, teacher_id, id], (err, result) => {
      if (err) {
        console.error('Error updating class:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.json({ message: 'Class updated successfully' });
    });
  } catch (error) {
    console.error('Error during class update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete Class
exports.deleteClass = (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM classes WHERE id = ?';

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error deleting class:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.json({ message: 'Class deleted successfully' });
    });
  } catch (error) {
    console.error('Error during class deletion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get All Teachers (Unchanged)
exports.getAllTeachers = (req, res) => {
  try {
    const query = 'SELECT id, username, email FROM users WHERE role = "teacher"';

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching teachers:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
