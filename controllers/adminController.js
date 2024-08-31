const db = require('../db/db');

exports.getAdminDashboardData = (req, res) => {
  try {
    // SQL queries for summary cards
    const totalTeachersQuery = `SELECT COUNT(*) AS total_teachers FROM users WHERE role = 'teacher'`;
    const totalClassesQuery = `SELECT COUNT(*) AS total_classes FROM classes`;
    const totalAttendanceRecordsQuery = `SELECT COUNT(*) AS total_attendance_records FROM attendance`;
    const unapprovedAttendanceQuery = `SELECT COUNT(*) AS unapproved_attendance FROM attendance WHERE approved_by_supervisor = FALSE`;

    const attendanceOverTimeQuery = `
  SELECT DATE(CONVERT_TZ(attendance_date, '+00:00', '+02:00')) AS date, COUNT(*) AS count 
  FROM attendance 
  GROUP BY DATE(CONVERT_TZ(attendance_date, '+00:00', '+02:00'))
  ORDER BY DATE(CONVERT_TZ(attendance_date, '+00:00', '+02:00'))
`;

  
  

    const approvalStatusDistributionQuery = `
      SELECT 
        SUM(CASE WHEN approved_by_supervisor = TRUE THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN approved_by_supervisor = FALSE THEN 1 ELSE 0 END) AS unapproved
      FROM attendance
    `;

    const classesPerTeacherQuery = `
      SELECT u.username AS teacher_name, COUNT(c.id) AS class_count
      FROM classes c
      JOIN users u ON c.teacher_id = u.id
      GROUP BY u.username
    `;

    const attendanceByDayOfWeekQuery = `
    SELECT day, COUNT(*) AS count
    FROM (
      SELECT DAYNAME(CONVERT_TZ(attendance_date, '+00:00', '+02:00')) AS day
      FROM attendance
    ) AS subquery
    GROUP BY day
    ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
  `;
  

    const latestAttendanceRecordsQuery = `
  SELECT 
    a.id, 
    u.username AS teacher_name, 
    c.course_name AS course_name, 
    DATE_FORMAT(CONVERT_TZ(a.attendance_date, '+00:00', '+02:00'), '%Y-%m-%d %H:%i:%s') AS attendance_date, 
    a.status, 
    a.approved_by_supervisor 
  FROM attendance a
  JOIN users u ON a.teacher_id = u.id
  JOIN classes c ON a.class_id = c.id
  ORDER BY a.attendance_date DESC
  LIMIT 5;
`;



    // Query for attendance by class
    const attendanceByClassQuery = `
      SELECT 
        c.course_name AS class_name, 
        COUNT(a.id) AS attendance_count 
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      GROUP BY c.course_name;
    `;

    // Execute all queries in parallel
    db.query(totalTeachersQuery, (err, totalTeachersResult) => {
      if (err) {
        console.error('Error fetching total teachers:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      db.query(totalClassesQuery, (err, totalClassesResult) => {
        if (err) {
          console.error('Error fetching total classes:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        db.query(totalAttendanceRecordsQuery, (err, totalAttendanceRecordsResult) => {
          if (err) {
            console.error('Error fetching total attendance records:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          db.query(unapprovedAttendanceQuery, (err, unapprovedAttendanceResult) => {
            if (err) {
              console.error('Error fetching unapproved attendance:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            db.query(attendanceOverTimeQuery, (err, attendanceOverTimeResult) => {
              if (err) {
                console.error('Error fetching attendance over time:', err);
                return res.status(500).json({ error: 'Internal server error' });
              }

              db.query(approvalStatusDistributionQuery, (err, approvalStatusDistributionResult) => {
                if (err) {
                  console.error('Error fetching approval status distribution:', err);
                  return res.status(500).json({ error: 'Internal server error' });
                }

                db.query(classesPerTeacherQuery, (err, classesPerTeacherResult) => {
                  if (err) {
                    console.error('Error fetching classes per teacher:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                  }

                  db.query(attendanceByDayOfWeekQuery, (err, attendanceByDayOfWeekResult) => {
                    if (err) {
                      console.error('Error fetching attendance by day of week:', err);
                      return res.status(500).json({ error: 'Internal server error' });
                    }

                    db.query(latestAttendanceRecordsQuery, (err, latestAttendanceRecordsResult) => {
                      if (err) {
                        console.error('Error fetching latest attendance records:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                      }

                      db.query(attendanceByClassQuery, (err, attendanceByClassResult) => {
                        if (err) {
                          console.error('Error fetching attendance by class:', err);
                          return res.status(500).json({ error: 'Internal server error' });
                        }

                        // Combine all data and send response
                        const dashboardData = {
                          // Data for cards
                          total_teachers: totalTeachersResult[0].total_teachers,
                          total_classes: totalClassesResult[0].total_classes,
                          total_attendance_records: totalAttendanceRecordsResult[0].total_attendance_records,
                          unapproved_attendance: unapprovedAttendanceResult[0].unapproved_attendance,

                          // Data for graphs
                          attendance_over_time: attendanceOverTimeResult,
                          approval_status_distribution: approvalStatusDistributionResult[0],
                          classes_per_teacher: classesPerTeacherResult,
                          attendance_by_day_of_week: attendanceByDayOfWeekResult,
                          latest_attendance_records: latestAttendanceRecordsResult,
                          attendance_by_class: attendanceByClassResult
                        };

                        res.json(dashboardData);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
