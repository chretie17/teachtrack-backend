const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'turachretien@gmail.com', // Your email address
    pass: 'isqz tflp rawa iwxr', // Your app-specific password
  },
});

// Function to send email notification
const sendNotification = () => {
  const mailOptions = {
    from: 'turachretien@gmail.com', // Your email address
    to: 'uwikevine09@gmail.com', // Supervisor's email address
    subject: 'New Attendance Waiting for Approval',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Attendance Record Notification</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #00447b;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .logo {
            width: 120px;
            height: auto;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px;
            text-align: center;
          }
          h1 {
            color: #00447b;
            margin-bottom: 20px;
            font-size: 24px;
          }
          p {
            margin-bottom: 20px;
            font-size: 16px;
          }
          .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #00447b;
            color: #ffffff !important; /* Make text white */
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
          .cta-button:hover {
            background-color: #fffff;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://auca.ac.rw/wp-content/uploads/2021/02/cropped-AUCA-logo-wide-webblue-2-1-1.png" alt="AUCA Logo" class="logo">
          </div>
          <div class="content">
            <h1>New Attendance Record Waiting for Approval</h1>
            <p>Dear Supervisor,</p>
            <p>We hope this email finds you well. We're reaching out to inform you that there is a new attendance record that requires your attention and approval.</p>
            <p>Your prompt review is crucial to maintaining accurate and up-to-date records. Please take a moment to log in to the system and review the pending attendance record.</p>
            <a href="http://localhost:5173/teachers-classes-schedule" class="cta-button">Log In to Review</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 Adventist University of Central Africa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email notification:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendNotification;