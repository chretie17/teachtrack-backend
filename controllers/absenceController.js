const db = require('../db/db');
const nodemailer = require('nodemailer');
const { format } = require('date-fns'); // Import date-fns for formatting dates

const EMAIL = 'uwikevine09@gmail.com'; // Supervisor's email
const EMAIL_PASSWORD = 'toum fwqr pgyn mert'; // Your app-specific password for Gmail

// Submit Absence Request
exports.submitAbsenceRequest = (req, res) => {
  const { teacher_id, class_id, absence_date, reason } = req.body;

  const insertQuery = `
    INSERT INTO absences (teacher_id, class_id, absence_date, reason, status)
    VALUES (?, ?, ?, ?, 'Pending')
  `;

  db.query(insertQuery, [teacher_id, class_id, absence_date, reason], (err, result) => {
    if (err) {
      console.error('Error submitting absence request:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: EMAIL,
      to: EMAIL,
      subject: 'Teacher Absence Notification',
      text: `A teacher has submitted an absence request.\n\nDetails:\nTeacher ID: ${teacher_id}\nClass ID: ${class_id}\nDate: ${format(new Date(absence_date), 'yyyy-MM-dd')}\nReason: ${reason}`,
    };

    transporter.sendMail(mailOptions, (mailErr) => {
      if (mailErr) {
        console.error('Error sending email:', mailErr);
        return res.status(500).json({ error: 'Error sending notification email' });
      }

      res.status(201).json({
        message: 'Absence request submitted successfully and email notification sent to the supervisor.',
      });
    });
  });
};

// Get Pending Absence Requests
exports.getPendingAbsenceRequests = (req, res) => {
  const query = `
    SELECT a.*, u.username AS teacher_name, c.course_name
    FROM absences a
    JOIN users u ON a.teacher_id = u.id
    JOIN classes c ON a.class_id = c.id
    WHERE a.status = 'Pending'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching absence requests:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Format absence_date for all results
    const formattedResults = results.map((row) => ({
      ...row,
      absence_date: format(new Date(row.absence_date), 'yyyy-MM-dd'),
    }));

    res.json(formattedResults);
  });
};

// Approve or Reject Absence Request
exports.updateAbsenceStatus = (req, res) => {
  const { id, status } = req.body;

  const updateQuery = `
    UPDATE absences 
    SET status = ? 
    WHERE id = ?
  `;

  db.query(updateQuery, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating absence status:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Absence request not found' });
    }

    res.json({ message: `Absence request ${status.toLowerCase()} successfully` });
  });
};

// Get Absence History for a Teacher
exports.getAbsenceHistoryForTeacher = (req, res) => {
  const { teacher_id } = req.params;

  const query = `
    SELECT a.*, c.course_code, c.course_name, 
           CASE 
             WHEN a.status = 'Approved' THEN 'Approved'
             WHEN a.status = 'Rejected' THEN 'Rejected'
             ELSE 'Pending'
           END AS approval_status
    FROM absences a
    JOIN classes c ON a.class_id = c.id
    WHERE a.teacher_id = ?
    ORDER BY a.absence_date DESC
  `;

  db.query(query, [teacher_id], (err, results) => {
    if (err) {
      console.error('Error fetching absence history:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Format absence_date for all results
    const formattedResults = results.map((row) => ({
      ...row,
      absence_date: format(new Date(row.absence_date), 'yyyy-MM-dd'),
    }));

    res.json(formattedResults);
  });
};
