const db = require('../db/db');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { format } = require('date-fns'); // Import format from date-fns

const JWT_SECRET = '48debc53eb84454ca9aa4371ef5b32bd'; // Your secret key

// API to generate QR code for a class using a short identifier
exports.generateQRCode = (req, res) => {
  const { teacher_id, class_id } = req.body;

  // Create a unique short identifier (e.g., UUID)
  const uniqueIdentifier = crypto.randomBytes(4).toString('hex');

  // Create a JWT token with essential information
  const payload = {
    teacher_id,
    class_id,
    date: new Date().toISOString().split('T')[0], // Use current date
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  // Store the mapping of the identifier and token to the class and teacher in the database
  const insertQuery = `
    INSERT INTO qr_code_mapping (identifier, teacher_id, class_id, token, date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [uniqueIdentifier, teacher_id, class_id, token, new Date().toISOString().split('T')[0]], (err) => {
    if (err) {
      console.error('Error storing token:', err);
      return res.status(500).json({ error: 'Error storing token' });
    }

    QRCode.toDataURL(uniqueIdentifier, { errorCorrectionLevel: 'L', width: 300, height: 300 }, (err, url) => {
      if (err) {
        console.error('Error generating QR code:', err);
        return res.status(500).json({ error: 'Error generating QR code' });
      }

      // Return the larger QR code URL
      res.json({ qrCodeUrl: url });
    });
  });
};

// Endpoint to mark attendance using the QR code
exports.markAttendanceUsingQRCode = (req, res) => {
  const { identifier, latitude, longitude } = req.body; // Get the unique identifier from the request

  // Lookup the stored JWT token using the scanned identifier
  const lookupQuery = `
    SELECT token FROM qr_code_mapping
    WHERE identifier = ?
  `;

  db.query(lookupQuery, [identifier], (err, results) => {
    if (err || results.length === 0) {
      console.error('Invalid QR code identifier or no matching token:', err);
      return res.status(400).json({ error: 'Invalid QR code identifier' });
    }

    const storedToken = results[0].token;

    // Verify and decode the stored JWT token
    jwt.verify(storedToken, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Invalid or expired JWT token:', err);
        return res.status(400).json({ error: 'Invalid or expired QR code' });
      }

      const { teacher_id, class_id, date } = decoded;

      // Fetch class details including class start and end times, and day of the week
      const classQuery = `
        SELECT start_time, end_time, day_of_week 
        FROM classes
        WHERE id = ?
      `;

      db.query(classQuery, [class_id], (err, classResults) => {
        if (err || classResults.length === 0) {
          console.error('Class not found:', err);
          return res.status(500).json({ error: 'Class not found' });
        }

        const { start_time, end_time, day_of_week } = classResults[0];
        const currentTime = format(new Date(), 'HH:mm'); // Get current time in HH:mm format
        const currentDay = format(new Date(), 'EEEE'); // Get current day of the week in full form

        // Check if current time is within class time
        if (currentTime < start_time || currentTime > end_time) {
          return res.status(400).json({
            error: `Attendance can only be marked between ${start_time} and ${end_time}.`,
          });
        }

        // Check if today is the correct day of the week
        if (currentDay !== day_of_week) {
          return res.status(400).json({
            error: `Attendance can only be marked on ${day_of_week}. Today is ${currentDay}.`,
          });
        }

        // Check if attendance is already recorded
        const checkQuery = `
          SELECT * FROM attendance 
          WHERE class_id = ? AND teacher_id = ? AND attendance_date = ?
        `;
        db.query(checkQuery, [class_id, teacher_id, date], (err, results) => {
          if (err) {
            console.error('Error checking attendance:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          if (results.length > 0) {
            return res.status(400).json({ error: 'Attendance already recorded for this class.' });
          }

          // Mark attendance
          const insertQuery = `
            INSERT INTO attendance (class_id, teacher_id, attendance_date, status, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          db.query(insertQuery, [class_id, teacher_id, date, 'Present', latitude, longitude], (err, result) => {
            if (err) {
              console.error('Error marking attendance:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.status(201).json({ message: 'Attendance marked successfully', attendance_id: result.insertId });
          });
        });
      });
    });
  });
};

const sendNotification = require('./notification'); 


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

      // Send notification after successfully inserting attendance
      sendNotification();

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
  exports.getUnapprovedAttendanceCount = (req, res) => {
    try {
      const query = `
        SELECT COUNT(*) AS unapprovedCount 
        FROM attendance 
        WHERE approved_by_supervisor = FALSE
      `;
  
      db.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching unapproved attendance count:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        // Send the count to the client
        res.json({ unapprovedCount: results[0].unapprovedCount });
      });
    } catch (error) {
      console.error('Error fetching unapproved attendance count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };