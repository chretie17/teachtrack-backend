const db = require('../db/db'); // Your database connection

// Function to fetch Attendance Summary Report data
exports.getAttendanceSummaryReport = (req, res) => {
  const { startDate, endDate } = req.query;

  // Query to fetch attendance summary with timezone conversion and date formatting
  let query = `
    SELECT DATE_FORMAT(CONVERT_TZ(attendance_date, '+00:00', '+02:00'), '%Y-%m-%d') AS date,  -- Convert to Rwanda Time and format as date
           SUM(CASE WHEN approved_by_supervisor = TRUE THEN 1 ELSE 0 END) AS approved,
           SUM(CASE WHEN approved_by_supervisor = FALSE THEN 1 ELSE 0 END) AS unapproved
    FROM attendance
  `;

  // Add date filtering if date range is provided
  if (startDate && endDate) {
    query += ` WHERE attendance_date BETWEEN ? AND ?`; // Original dates for filtering
  }

  // Group by the converted date in Rwanda Time
  query += ` GROUP BY DATE_FORMAT(CONVERT_TZ(attendance_date, '+00:00', '+02:00'), '%Y-%m-%d') 
             ORDER BY DATE_FORMAT(CONVERT_TZ(attendance_date, '+00:00', '+02:00'), '%Y-%m-%d')`;

  // Use original UTC dates in the query parameters for filtering
  const queryParams = startDate && endDate ? [startDate, endDate] : [];

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Error fetching attendance summary report:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(result); // Send data to the frontend
  });
};


// Function to fetch detailed Teacher Performance Report data
exports.getTeacherPerformanceReport = (req, res) => {
  const { startDate, endDate } = req.query;

  let query = `
    SELECT u.username AS teacher_name,
           c.course_name AS lesson_name,
           DATE_FORMAT(CONVERT_TZ(a.attendance_date, '+00:00', '+02:00'), '%Y-%m-%d') AS class_date,  -- Convert and format date to Rwanda Time
           CASE WHEN a.approved_by_supervisor = TRUE THEN 'Present' ELSE 'Absent' END AS attendance_status
    FROM users u
    LEFT JOIN classes c ON u.id = c.teacher_id
    LEFT JOIN attendance a ON c.id = a.class_id
    WHERE u.role = 'teacher'
  `;

  // Add date filtering if date range is provided
  const queryParams = [];

  if (startDate && endDate) {
    query += ` AND a.attendance_date BETWEEN CONVERT_TZ(?, '+00:00', '+02:00') AND CONVERT_TZ(?, '+00:00', '+02:00')`;
    queryParams.push(startDate, endDate);
  }

  query += ` ORDER BY u.username, a.attendance_date`;

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Error fetching teacher performance report:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Adding custom insights and recommendations to the result
    const insights = result.map(row => ({
      ...row,
      recommendation: row.attendance_status === 'Absent' 
        ? 'Needs Improvement. Consider support programs to help manage attendance.' 
        : 'Exemplary performance. Consider recognizing this teacher for perfect attendance.'
    }));

    res.json(insights); // Send data to the frontend with added insights
  });
};

// Function to fetch a Custom Report data
exports.getCustomReport = (req, res) => {
  const { reportType, startDate, endDate } = req.body;

  let query;
  const queryParams = [];

  switch (reportType) {
    case 'attendance':
      query = `
        SELECT DATE(CONVERT_TZ(attendance_date, '+00:00', '+02:00')) AS date,
               SUM(CASE WHEN approved_by_supervisor = TRUE THEN 1 ELSE 0 END) AS approved,
               SUM(CASE WHEN approved_by_supervisor = FALSE THEN 1 ELSE 0 END) AS unapproved
        FROM attendance
      `;

      if (startDate && endDate) {
        query += ` WHERE attendance_date BETWEEN ? AND ?`; // Use the date parameters directly
        queryParams.push(startDate, endDate);
      }

      query += ` GROUP BY DATE(CONVERT_TZ(attendance_date, '+00:00', '+02:00')) ORDER BY DATE(CONVERT_TZ(attendance_date, '+00:00', '+02:00'))`;
      break;

    case 'teacherPerformance':
      query = `
        SELECT u.username AS teacher_name,
               c.course_name AS lesson_name,
               DATE_FORMAT(CONVERT_TZ(a.attendance_date, '+00:00', '+02:00'), '%Y-%m-%d') AS class_date,
               CASE WHEN a.approved_by_supervisor = TRUE THEN 'Present' ELSE 'Absent' END AS attendance_status
        FROM users u
        LEFT JOIN classes c ON u.id = c.teacher_id
        LEFT JOIN attendance a ON c.id = a.class_id
        WHERE u.role = 'teacher'
      `;

      if (startDate && endDate) {
        query += ` AND a.attendance_date BETWEEN ? AND ?`; // Use the date parameters directly
        queryParams.push(startDate, endDate);
      }

      query += ` ORDER BY u.username, a.attendance_date`;
      break;

    default:
      return res.status(400).json({ error: 'Invalid report type' });
  }

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Error fetching custom report:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Add customization and insights for the custom report
    const customizedResult = result.map(row => ({
      ...row,
      insights: row.attendance_status === 'Absent'
        ? 'Action Required: Follow-up with the teacher to understand the absence reason.'
        : 'Excellent Performance: Keep up the good work!'
    }));

    res.json(customizedResult); // Send customized data to the frontend
  });
};