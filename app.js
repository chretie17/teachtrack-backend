const express = require('express');
const cors = require('cors');
const db = require('./db/db'); // Import the database connection

const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const supervisorRoutes = require('./routes/supervisorRoutes');
const classRoutes = require('./routes/classRoutes');
const usersRoutes = require('./routes/userRoutes');
const authenticateToken = require('./middleware/auth');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/admin');
const reportsRoutes = require ('./routes/report');
const app = express();

app.use(express.json());

// Configure CORS to allow requests from your frontend's origin
app.use(cors({
  origin: 'http://localhost:5173'  // Adjust this to match your frontend's URL
}));

// Test database connection
db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit the process with an error code
  } else {
    console.log('Connected to the database successfully.');
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/teacher', authenticateToken, teacherRoutes);
app.use('/api/supervisor',  supervisorRoutes);
app.use('/api/classes',  classRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
