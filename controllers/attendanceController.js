// controllers/attendanceController.js
const db = require('../db/db');



// Mark Attendance (Unchanged)
exports.markAttendance = (req, res) => {
  try {
    const { class_id, teacher_id, attendance_date, status } = req.body;

    const query = `
      INSERT INTO attendance (class_id, teacher_id, attendance_date, status)
      VALUES (?, ?, ?, ?)
    `;

    db.query(query, [class_id, teacher_id, attendance_date, status], (err, result) => {
      if (err) {
        console.error('Error marking attendance:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(201).json({ message: 'Attendance marked successfully' });
    });
  } catch (error) {
    console.error('Error during attendance marking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  