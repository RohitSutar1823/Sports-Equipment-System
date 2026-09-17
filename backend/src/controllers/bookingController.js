const db = require('../config/db');

// GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const query = `
      SELECT 
        B.Booking_ID,
        B.Student_ID,
        B.Facility_ID,
        B.Date,
        B.Start_Time,
        B.End_Time,
        B.Purpose,
        B.Status,
        S.Name AS Student_Name,
        S.Department AS Student_Department,
        S.Email AS Student_Email,
        F.Facility_Name,
        F.Type AS Facility_Type,
        F.Location AS Facility_Location
      FROM BOOKING B
      JOIN STUDENT S ON B.Student_ID = S.Student_ID
      JOIN SPORTS_FACILITY F ON B.Facility_ID = F.Facility_ID
      ORDER BY B.Date DESC, B.Start_Time DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const query = `
      SELECT 
        B.*,
        S.Name AS Student_Name,
        F.Facility_Name
      FROM BOOKING B
      JOIN STUDENT S ON B.Student_ID = S.Student_ID
      JOIN SPORTS_FACILITY F ON B.Facility_ID = F.Facility_ID
      WHERE B.Booking_ID = ?
    `;
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { Student_ID, Facility_ID, Date, Start_Time, End_Time, Purpose, Status } = req.body;

    if (!Student_ID || !Facility_ID || !Date || !Start_Time || !End_Time) {
      return res.status(400).json({ message: 'Student, Facility, Date, Start Time, and End Time are required.' });
    }

    // Verify Student exists
    const [student] = await db.query('SELECT Student_ID FROM STUDENT WHERE Student_ID = ?', [Student_ID]);
    if (student.length === 0) {
      return res.status(400).json({ message: 'Selected student does not exist.' });
    }

    // Verify Facility exists
    const [facility] = await db.query('SELECT Facility_ID, Status FROM SPORTS_FACILITY WHERE Facility_ID = ?', [Facility_ID]);
    if (facility.length === 0) {
      return res.status(400).json({ message: 'Selected facility does not exist.' });
    }
    if (facility[0].Status === 'Maintenance') {
      return res.status(400).json({ message: 'Facility is currently closed for maintenance.' });
    }

    // Check for conflicting confirmed bookings for the same facility on the same date and overlapping time
    const [conflict] = await db.query(
      `SELECT Booking_ID FROM BOOKING 
       WHERE Facility_ID = ? 
         AND Date = ? 
         AND Status = 'Confirmed'
         AND (Start_Time < ? AND End_Time > ?)`,
      [Facility_ID, Date, End_Time, Start_Time]
    );

    if (conflict.length > 0) {
      return res.status(400).json({ 
        message: 'Conflict: This facility is already booked during the selected time interval.' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO BOOKING (Student_ID, Facility_ID, Date, Start_Time, End_Time, Purpose, Status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [Student_ID, Facility_ID, Date, Start_Time, End_Time, Purpose || null, Status || 'Confirmed']
    );

    // Fetch newly created record with joins
    const [newBooking] = await db.query(
      `SELECT B.*, S.Name AS Student_Name, F.Facility_Name 
       FROM BOOKING B 
       JOIN STUDENT S ON B.Student_ID = S.Student_ID 
       JOIN SPORTS_FACILITY F ON B.Facility_ID = F.Facility_ID 
       WHERE B.Booking_ID = ?`,
      [result.insertId]
    );

    res.status(201).json(newBooking[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { Student_ID, Facility_ID, Date, Start_Time, End_Time, Purpose, Status } = req.body;

    const [existing] = await db.query('SELECT * FROM BOOKING WHERE Booking_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedStudentId = Student_ID || existing[0].Student_ID;
    const updatedFacilityId = Facility_ID || existing[0].Facility_ID;
    const updatedDate = Date || existing[0].Date;
    const updatedStart = Start_Time || existing[0].Start_Time;
    const updatedEnd = End_Time || existing[0].End_Time;
    const updatedPurpose = Purpose !== undefined ? Purpose : existing[0].Purpose;
    const updatedStatus = Status || existing[0].Status;

    await db.query(
      `UPDATE BOOKING 
       SET Student_ID = ?, Facility_ID = ?, Date = ?, Start_Time = ?, End_Time = ?, Purpose = ?, Status = ? 
       WHERE Booking_ID = ?`,
      [updatedStudentId, updatedFacilityId, updatedDate, updatedStart, updatedEnd, updatedPurpose, updatedStatus, id]
    );

    const [updated] = await db.query(
      `SELECT B.*, S.Name AS Student_Name, F.Facility_Name 
       FROM BOOKING B 
       JOIN STUDENT S ON B.Student_ID = S.Student_ID 
       JOIN SPORTS_FACILITY F ON B.Facility_ID = F.Facility_ID 
       WHERE B.Booking_ID = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM BOOKING WHERE Booking_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await db.query('DELETE FROM BOOKING WHERE Booking_ID = ?', [id]);
    res.json({ message: 'Booking deleted successfully', bookingId: Number(id) });
  } catch (error) {
    console.error('Error deleting booking:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Cannot delete booking because an equipment issue is linked to it.'
      });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
