const pool = require('../db/db');

exports.checkIn = async (req, res) => {
  const { teacherId, classId, checkInTime } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO attendance (teacher_id, class_id, check_in_time) VALUES (?, ?, ?)',
      [teacherId, classId, checkInTime]
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkOut = async (req, res) => {
  const { attendanceId, checkOutTime } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE attendance SET check_out_time = ? WHERE id = ?',
      [checkOutTime, attendanceId]
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  const { teacherId } = req.query;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM attendance WHERE teacher_id = ? ORDER BY check_in_time DESC',
      [teacherId]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
