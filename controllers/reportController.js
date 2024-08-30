const db = require('../db/db'); // Your database connection

// Function to fetch Attendance Summary Report data
exports.getAttendanceSummaryReport = (req, res) => {
  const { startDate, endDate } = req.query;

  let query = `
    SELECT DATE(attendance_date) AS date,
           SUM(CASE WHEN approved_by_supervisor = TRUE THEN 1 ELSE 0 END) AS approved,
           SUM(CASE WHEN approved_by_supervisor = FALSE THEN 1 ELSE 0 END) AS unapproved
    FROM attendance
  `;

  // Add date filtering if date range is provided
  if (startDate && endDate) {
    query += ` WHERE attendance_date BETWEEN ? AND ?`;
  }

  query += ` GROUP BY DATE(attendance_date) ORDER BY DATE(attendance_date)`;

  const queryParams = startDate && endDate ? [startDate, endDate] : [];

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Error fetching attendance summary report:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(result); // Send data to the frontend
  });
};

// Function to fetch Teacher Performance Report data
exports.getTeacherPerformanceReport = (req, res) => {
  const { startDate, endDate } = req.query;

  let query = `
    SELECT u.username AS teacher_name,
           COUNT(c.id) AS total_classes,
           COUNT(a.id) AS total_attendance,
           SUM(CASE WHEN a.approved_by_supervisor = TRUE THEN 1 ELSE 0 END) AS approved_attendance
    FROM users u
    LEFT JOIN classes c ON u.id = c.teacher_id
    LEFT JOIN attendance a ON c.id = a.class_id
    WHERE u.role = 'teacher'
  `;

  if (startDate && endDate) {
    query += ` AND a.attendance_date BETWEEN ? AND ?`;
  }

  query += ` GROUP BY u.username ORDER BY approved_attendance DESC`;

  const queryParams = startDate && endDate ? [startDate, endDate] : [];

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Error fetching teacher performance report:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(result); // Send data to the frontend
  });
};

// Function to fetch a Custom Report data
exports.getCustomReport = (req, res) => {
  const { reportType, startDate, endDate } = req.body;

  let query;
  let queryParams = [];

  switch (reportType) {
    case 'attendance':
      query = `
        SELECT DATE(attendance_date) AS date,
               SUM(CASE WHEN approved_by_supervisor = TRUE THEN 1 ELSE 0 END) AS approved,
               SUM(CASE WHEN approved_by_supervisor = FALSE THEN 1 ELSE 0 END) AS unapproved
        FROM attendance
      `;

      if (startDate && endDate) {
        query += ` WHERE attendance_date BETWEEN ? AND ?`;
        queryParams = [startDate, endDate];
      }

      query += ` GROUP BY DATE(attendance_date) ORDER BY DATE(attendance_date)`;
      break;

    case 'teacherPerformance':
      query = `
        SELECT u.username AS teacher_name,
               COUNT(c.id) AS total_classes,
               COUNT(a.id) AS total_attendance,
               SUM(CASE WHEN a.approved_by_supervisor = TRUE THEN 1 ELSE 0 END) AS approved_attendance
        FROM users u
        LEFT JOIN classes c ON u.id = c.teacher_id
        LEFT JOIN attendance a ON c.id = a.class_id
        WHERE u.role = 'teacher'
      `;

      if (startDate && endDate) {
        query += ` AND a.attendance_date BETWEEN ? AND ?`;
        queryParams = [startDate, endDate];
      }

      query += ` GROUP BY u.username ORDER BY approved_attendance DESC`;
      break;

    default:
      return res.status(400).json({ error: 'Invalid report type' });
  }

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Error fetching custom report:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(result); // Send data to the frontend
  });
};
