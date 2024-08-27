const pool = require('../db/db');

exports.verifyAttendance = async (req, res) => {
  const { attendanceId, supervisorId, verificationTime } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE attendance SET verified_by = ?, verification_time = ? WHERE id = ?',
      [supervisorId, verificationTime, attendanceId]
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingVerifications = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM attendance WHERE verified_by IS NULL ORDER BY check_in_time DESC'
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
