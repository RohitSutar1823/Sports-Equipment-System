const db = require('../config/db');

// GET /api/students
exports.getAllStudents = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM STUDENT ORDER BY Student_ID ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// GET /api/students/:id
exports.getStudentById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM STUDENT WHERE Student_ID = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// POST /api/students
exports.createStudent = async (req, res) => {
  try {
    const { Name, Department, Year, Phone, Email } = req.body;
    if (!Name || !Name.trim()) {
      return res.status(400).json({ message: 'Student name is required' });
    }
    const [result] = await db.query(
      'INSERT INTO STUDENT (Name, Department, Year, Phone, Email) VALUES (?, ?, ?, ?, ?)',
      [Name.trim(), Department || null, Year || null, Phone || null, Email || null]
    );
    const [newStudent] = await db.query('SELECT * FROM STUDENT WHERE Student_ID = ?', [result.insertId]);
    res.status(201).json(newStudent[0]);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const { Name, Department, Year, Phone, Email } = req.body;
    const { id } = req.params;
    if (!Name || !Name.trim()) {
      return res.status(400).json({ message: 'Student name is required' });
    }
    const [check] = await db.query('SELECT * FROM STUDENT WHERE Student_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await db.query(
      'UPDATE STUDENT SET Name = ?, Department = ?, Year = ?, Phone = ?, Email = ? WHERE Student_ID = ?',
      [Name.trim(), Department || null, Year || null, Phone || null, Email || null, id]
    );
    const [updated] = await db.query('SELECT * FROM STUDENT WHERE Student_ID = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const [check] = await db.query('SELECT * FROM STUDENT WHERE Student_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await db.query('DELETE FROM STUDENT WHERE Student_ID = ?', [id]);
    res.json({ message: 'Student deleted successfully', studentId: Number(id) });
  } catch (error) {
    console.error('Error deleting student:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Cannot delete student because related records (bookings, issued equipment, or schedule) exist.'
      });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
