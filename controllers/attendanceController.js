// controllers/attendanceController.js
const db = require('../db/db');



// controllers/attendanceController.js

exports.markAttendance = (req, res) => {
    const { class_id, teacher_id, attendance_date, status, latitude, longitude } = req.body;
  
    const checkQuery = `
      SELECT * FROM attendance 
      WHERE class_id = ? AND teacher_id = ? AND attendance_date = ?
    `;
  
    db.query(checkQuery, [class_id, teacher_id, attendance_date], (err, results) => {
      if (err) {
        console.error('Error checking attendance:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (results.length > 0) {
        return res.status(400).json({ error: 'Attendance has already been recorded for this class.' });
      }
  
      const insertQuery = `
        INSERT INTO attendance (class_id, teacher_id, attendance_date, status, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
  
      db.query(insertQuery, [class_id, teacher_id, attendance_date, status, latitude, longitude], (err, result) => {
        if (err) {
          console.error('Error marking attendance:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        res.status(201).json({ message: 'Attendance marked successfully', attendance_id: result.insertId });
      });
    });
  };
  
  

// Get Unapproved Attendance for Supervisor
exports.getUnapprovedAttendance = (req, res) => {
  try {
    const query = `
      SELECT a.*, c.course_name, u.username AS teacher_name 
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      JOIN users u ON a.teacher_id = u.id
      WHERE a.approved_by_supervisor = FALSE
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching unapproved attendance:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching unapproved attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve Attendance by Supervisor
exports.approveAttendance = (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE attendance 
      SET approved_by_supervisor = TRUE
      WHERE id = ?
    `;

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
  } catch (error) {
    console.error('Error during attendance approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// controllers/attendanceController.js
exports.getClassesForTeacher = (req, res) => {
    try {
      const { teacher_id } = req.params;
  
      const query = `
        SELECT c.*, u.username AS teacher_name 
        FROM classes c 
        JOIN users u ON c.teacher_id = u.id
        WHERE c.teacher_id = ?
      `;
  
      db.query(query, [teacher_id], (err, results) => {
        if (err) {
          console.error('Error fetching classes for teacher:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        res.json(results);
      });
    } catch (error) {
      console.error('Error fetching classes for teacher:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

exports.getAttendanceHistoryForTeacher = (req, res) => {
    const { teacher_id } = req.params;
  
    const query = `
      SELECT a.*, c.course_code, c.course_name, 
             CASE 
               WHEN a.approved_by_supervisor = 1 THEN 'Approved'
               ELSE 'Unapproved'
             END AS approval_status
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.teacher_id = ?
      ORDER BY a.attendance_date DESC
    `;
  
    db.query(query, [teacher_id], (err, results) => {
      if (err) {
        console.error('Error fetching attendance history:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      res.json(results);
    });
  };
  