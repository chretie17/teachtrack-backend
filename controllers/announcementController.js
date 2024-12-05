const db = require('../db/db');
const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text'); // Recommended addition

exports.createAnnouncement = async (req, res) => {
   try {
     const { subject, message } = req.body;

     // Enhanced input validation
     if (!subject || subject.trim() === '') {
       return res.status(400).json({ error: 'Subject cannot be empty' });
     }
     if (!message || message.trim() === '') {
       return res.status(400).json({ error: 'Message content is required' });
     }

     // SQL query with parameterized query for security
     const query = 'SELECT email FROM users WHERE role = ?';

     db.query(query, ['TEACHER'], async (err, results) => {
       if (err) {
         console.error('Error fetching teacher emails:', err);
         return res.status(500).json({ error: 'Database error occurred' });
       }

       if (results.length === 0) {
         return res.status(404).json({ message: 'No teachers found to notify' });
       }

       // Secure email configuration
       const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'uwikevine09@gmail.com',  // Supervisor's email
          pass: 'toum fwqr pgyn mert',   // Your app-specific password
        },
      });

       // Create a professional HTML email template
       const htmlEmail = `
       <!DOCTYPE html>
       <html lang="en">
       <head>
         <meta charset="UTF-8">
         <style>
           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
           .container { 
             max-width: 600px; 
             margin: 0 auto; 
             padding: 20px; 
             background-color: #f4f4f4; 
             border-radius: 8px;
           }
           .header { 
             background-color: #003D73; 
             color: white; 
             padding: 10px 20px; 
             text-align: center; 
             border-radius: 8px 8px 0 0;
           }
           .content { 
             background-color: white; 
             padding: 20px; 
             border-radius: 0 0 8px 8px; 
           }
         </style>
       </head>
       <body>
         <div class="container">
           <div class="header">
             <h1>School Announcement</h1>
           </div>
           <div class="content">
             <h2>${subject}</h2>
             <p>${message}</p>
             <hr>
             <small>This is an official communication. Please do not reply to this email.</small>
           </div>
         </div>
       </body>
       </html>
       `;

       // Email options with both HTML and plain text
       const mailOptions = {
         from: {
           name: 'School Administration',
           address: process.env.EMAIL_USER
         },
         to: results.map(teacher => teacher.email),
         subject: `Announcement: ${subject}`,
         html: htmlEmail,
         text: htmlToText(htmlEmail), // Convert HTML to plain text for email clients
         replyTo: 'noreply@school.com'
       };

       // Send email with improved error handling
       transporter.sendMail(mailOptions, (emailErr, info) => {
         if (emailErr) {
           console.error('Email sending error:', emailErr);
           return res.status(500).json({ 
             error: 'Failed to send announcement', 
             details: emailErr.message 
           });
         }

         // Log successful email dispatch
         console.log('Announcement email sent:', {
           subject: subject,
           recipients: results.length,
           messageId: info.messageId
         });

         res.status(200).json({ 
           message: 'Announcement sent successfully', 
           recipientCount: results.length 
         });
       });
     });
   } catch (error) {
     console.error('Announcement creation error:', error);
     res.status(500).json({ error: 'Unexpected server error' });
   }
};