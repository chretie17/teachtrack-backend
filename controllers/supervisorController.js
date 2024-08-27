// controllers/supervisorController.js
const db = require('../db/db');

// Get all teachers
exports.getAllTeachers = (req, res) => {
  const query = `SELECT * FROM users WHERE role = 'teacher'`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching teachers:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
};

// Update a teacher
exports.updateTeacher = (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  const query = 'UPDATE users SET username = ?, email = ? WHERE id = ? AND role = "teacher"';

  db.query(query, [username, email, id], (err, result) => {
    if (err) {
      console.error('Error updating teacher:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teacher updated successfully' });
  });
};

// Delete a teacher
exports.deleteTeacher = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM users WHERE id = ? AND role = "teacher"';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting teacher:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teacher deleted successfully' });
  });
};

// Get all attendance records
exports.getAllAttendanceRecords = (req, res) => {
  const query = `
    SELECT a.*, u.username AS teacher_name, c.course_code, c.course_name 
    FROM attendance a
    JOIN users u ON a.teacher_id = u.id
    JOIN classes c ON a.class_id = c.id
    ORDER BY a.attendance_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching attendance records:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
};

// Approve attendance
exports.approveAttendance = (req, res) => {
  const { id } = req.params;

  const query = 'UPDATE attendance SET approved_by_supervisor = 1 WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error approving attendance:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance approved successfully' });
  });
};
