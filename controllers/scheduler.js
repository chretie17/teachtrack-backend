const cron = require('node-cron');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const db = require('../db/db');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'uwikevine09@gmail.com',
    pass: 'toum fwqr pgyn mert'
  }
});

// Schedule to check every minute
cron.schedule('* * * * *', () => {
  const currentTimeKigali = moment.tz('Africa/Kigali').format('YYYY-MM-DD HH:mm:ss');

  const query = `
    SELECT c.id AS class_id, c.end_time, c.day_of_week, c.teacher_id, u.username AS teacher_name
    FROM classes c
    LEFT JOIN attendance a ON c.id = a.class_id 
      AND a.attendance_date = CURDATE()
    JOIN users u ON c.teacher_id = u.id
    WHERE a.id IS NULL 
      AND TIME(c.end_time) < TIME(?)
      AND c.day_of_week = DAYNAME(?)
  `;

  db.query(query, [currentTimeKigali, currentTimeKigali], (err, results) => {
    if (err) {
      console.error('Error checking for unattended classes:', err);
      return;
    }

    results.forEach((classData) => {
      const { class_id, teacher_id, teacher_name } = classData;

      const insertQuery = `
        INSERT INTO attendance (class_id, teacher_id, attendance_date, status)
        VALUES (?, ?, CURDATE(), 'Absent')
      `;

      db.query(insertQuery, [class_id, teacher_id], (err) => {
        if (err) {
          console.error('Error marking teacher absent:', err);
        } else {
          console.log(`Marked teacher ${teacher_name} as absent for class ${class_id}.`);

          // Create a more professional and visually appealing email
          const mailOptions = {
            from: 'uwikevine09@gmail.com', 
            to: 'uwikevine09@gmail.com', 
            subject: 'Attendance Alert: Teacher Marked Absent',
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2c3e50;">Attendance Notification</h2>
                <p>Dear Administrator,</p>
                <p>We would like to inform you that the teacher <strong>${teacher_name}</strong> has been marked as <strong style="color: #e74c3c;">Absent</strong> for today's class.</p>
                <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Class ID:</strong></td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${class_id}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Teacher:</strong></td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${teacher_name}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;"><strong>Date:</strong></td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${moment.tz('Africa/Kigali').format('YYYY-MM-DD')}</td>
                  </tr>
                </table>
                <p>Please take the necessary actions accordingly.</p>
                <p>Best regards,</p>
                <p><strong>Attendance Management System</strong></p>
                <hr>
                <small style="color: #999;">This is an automated message, please do not reply.</small>
              </div>
            `
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }
      });
    });
  });
});
