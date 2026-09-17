const db = require('../config/db');

// GET /api/schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const query = `
      SELECT 
        LS.Schedule_ID,
        LS.Student_ID,
        LS.Day,
        LS.Subject,
        LS.Start_Time,
        LS.End_Time,
        S.Name AS Student_Name,
        S.Department AS Student_Department,
        S.Year AS Student_Year
      FROM LECTURE_SCHEDULE LS
      JOIN STUDENT S ON LS.Student_ID = S.Student_ID
      ORDER BY 
        FIELD(LS.Day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        LS.Start_Time ASC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching lecture schedules:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// GET /api/schedules/:id
exports.getScheduleById = async (req, res) => {
  try {
    const query = `
      SELECT 
        LS.*,
        S.Name AS Student_Name,
        S.Department AS Student_Department
      FROM LECTURE_SCHEDULE LS
      JOIN STUDENT S ON LS.Student_ID = S.Student_ID
      WHERE LS.Schedule_ID = ?
    `;
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lecture schedule not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// POST /api/schedules
exports.createSchedule = async (req, res) => {
  try {
    const { Student_ID, Day, Subject, Start_Time, End_Time } = req.body;

    if (!Student_ID || !Subject || !Day) {
      return res.status(400).json({ message: 'Student, Day, and Subject are required.' });
    }

    const [student] = await db.query('SELECT Student_ID FROM STUDENT WHERE Student_ID = ?', [Student_ID]);
    if (student.length === 0) {
      return res.status(400).json({ message: 'Selected student does not exist.' });
    }

    const [result] = await db.query(
      'INSERT INTO LECTURE_SCHEDULE (Student_ID, Day, Subject, Start_Time, End_Time) VALUES (?, ?, ?, ?, ?)',
      [Student_ID, Day, Subject.trim(), Start_Time || null, End_Time || null]
    );

    const [newSchedule] = await db.query(
      `SELECT LS.*, S.Name AS Student_Name, S.Department AS Student_Department
       FROM LECTURE_SCHEDULE LS
       JOIN STUDENT S ON LS.Student_ID = S.Student_ID
       WHERE LS.Schedule_ID = ?`,
      [result.insertId]
    );

    res.status(201).json(newSchedule[0]);
  } catch (error) {
    console.error('Error creating lecture schedule:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// PUT /api/schedules/:id
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { Student_ID, Day, Subject, Start_Time, End_Time } = req.body;

    const [check] = await db.query('SELECT * FROM LECTURE_SCHEDULE WHERE Schedule_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Lecture schedule not found' });
    }

    const current = check[0];
    const sId = Student_ID || current.Student_ID;
    const dayVal = Day || current.Day;
    const subjVal = Subject !== undefined ? Subject.trim() : current.Subject;
    const sTime = Start_Time !== undefined ? Start_Time : current.Start_Time;
    const eTime = End_Time !== undefined ? End_Time : current.End_Time;

    await db.query(
      'UPDATE LECTURE_SCHEDULE SET Student_ID = ?, Day = ?, Subject = ?, Start_Time = ?, End_Time = ? WHERE Schedule_ID = ?',
      [sId, dayVal, subjVal, sTime, eTime, id]
    );

    const [updated] = await db.query(
      `SELECT LS.*, S.Name AS Student_Name, S.Department AS Student_Department
       FROM LECTURE_SCHEDULE LS
       JOIN STUDENT S ON LS.Student_ID = S.Student_ID
       WHERE LS.Schedule_ID = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating lecture schedule:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const [check] = await db.query('SELECT * FROM LECTURE_SCHEDULE WHERE Schedule_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Lecture schedule not found' });
    }

    await db.query('DELETE FROM LECTURE_SCHEDULE WHERE Schedule_ID = ?', [id]);
    res.json({ message: 'Lecture schedule deleted successfully', scheduleId: Number(id) });
  } catch (error) {
    console.error('Error deleting lecture schedule:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
