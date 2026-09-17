const db = require('../config/db');

// GET /api/issues
exports.getAllIssues = async (req, res) => {
  try {
    const query = `
      SELECT 
        EI.Issue_ID,
        EI.Student_ID,
        EI.Equipment_ID,
        EI.Booking_ID,
        EI.Issue_Date,
        EI.Return_Date,
        EI.Quantity,
        EI.Status,
        S.Name AS Student_Name,
        S.Department AS Student_Department,
        S.Phone AS Student_Phone,
        S.Email AS Student_Email,
        E.Equipment_Name,
        E.Category AS Equipment_Category,
        E.Condition AS Equipment_Condition,
        B.Purpose AS Booking_Purpose
      FROM EQUIPMENT_ISSUE EI
      JOIN STUDENT S ON EI.Student_ID = S.Student_ID
      JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
      LEFT JOIN BOOKING B ON EI.Booking_ID = B.Booking_ID
      ORDER BY EI.Issue_ID DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// GET /api/issues/:id
exports.getIssueById = async (req, res) => {
  try {
    const query = `
      SELECT 
        EI.*,
        S.Name AS Student_Name,
        S.Email AS Student_Email,
        E.Equipment_Name,
        E.Category AS Equipment_Category,
        B.Purpose AS Booking_Purpose
      FROM EQUIPMENT_ISSUE EI
      JOIN STUDENT S ON EI.Student_ID = S.Student_ID
      JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
      LEFT JOIN BOOKING B ON EI.Booking_ID = B.Booking_ID
      WHERE EI.Issue_ID = ?
    `;
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Equipment issue record not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// POST /api/issues - Issue Equipment
exports.createIssue = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { Student_ID, Equipment_ID, Booking_ID, Issue_Date, Quantity } = req.body;

    if (!Student_ID || !Equipment_ID || !Issue_Date) {
      return res.status(400).json({ message: 'Student, Equipment, and Issue Date are required.' });
    }

    const qty = parseInt(Quantity, 10) || 1;
    if (qty <= 0) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    await conn.beginTransaction();

    // 1. Verify student exists
    const [students] = await conn.query('SELECT Student_ID, Name FROM STUDENT WHERE Student_ID = ?', [Student_ID]);
    if (students.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Selected student does not exist.' });
    }

    // 2. Lock & check equipment stock
    const [equipment] = await conn.query(
      'SELECT Equipment_ID, Equipment_Name, Available_Quantity FROM EQUIPMENT WHERE Equipment_ID = ? FOR UPDATE',
      [Equipment_ID]
    );

    if (equipment.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Selected equipment does not exist.' });
    }

    const currentItem = equipment[0];

    // Critical business rule: Reject if Available_Quantity is less than requested Quantity
    if (currentItem.Available_Quantity < qty) {
      await conn.rollback();
      return res.status(400).json({
        message: `Insufficient stock for "${currentItem.Equipment_Name}". Requested: ${qty}, Available: ${currentItem.Available_Quantity}.`
      });
    }

    // 3. Decrease Available_Quantity
    await conn.query(
      'UPDATE EQUIPMENT SET Available_Quantity = Available_Quantity - ? WHERE Equipment_ID = ?',
      [qty, Equipment_ID]
    );

    // 4. Create EQUIPMENT_ISSUE record
    const [result] = await conn.query(
      `INSERT INTO EQUIPMENT_ISSUE 
       (Student_ID, Equipment_ID, Booking_ID, Issue_Date, Return_Date, Quantity, Status) 
       VALUES (?, ?, ?, ?, NULL, ?, 'Issued')`,
      [Student_ID, Equipment_ID, Booking_ID || null, Issue_Date, qty]
    );

    await conn.commit();

    // Fetch newly created record
    const [newIssue] = await db.query(
      `SELECT 
        EI.*, 
        S.Name AS Student_Name, 
        E.Equipment_Name,
        E.Available_Quantity AS Current_Available_Quantity
       FROM EQUIPMENT_ISSUE EI
       JOIN STUDENT S ON EI.Student_ID = S.Student_ID
       JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
       WHERE EI.Issue_ID = ?`,
      [result.insertId]
    );

    res.status(201).json(newIssue[0]);
  } catch (error) {
    await conn.rollback();
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    conn.release();
  }
};

// PUT /api/issues/:id - Return Equipment & check for fines (late / damaged)
exports.returnIssue = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { 
      Return_Date, 
      Is_Damaged, 
      Damage_Description, 
      Damage_Cost, 
      New_Condition 
    } = req.body;

    await conn.beginTransaction();

    // 1. Lock issue record
    const [issues] = await conn.query(
      'SELECT * FROM EQUIPMENT_ISSUE WHERE Issue_ID = ? FOR UPDATE',
      [id]
    );

    if (issues.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Equipment issue record not found.' });
    }

    const issue = issues[0];
    if (issue.Status === 'Returned') {
      await conn.rollback();
      return res.status(400).json({ message: 'This equipment issue has already been marked as returned.' });
    }

    // Determine actual return date (fallback to today YYYY-MM-DD)
    const returnDateStr = Return_Date || new Date().toISOString().split('T')[0];

    // 2. Mark issue as returned
    await conn.query(
      `UPDATE EQUIPMENT_ISSUE 
       SET Return_Date = ?, Status = 'Returned' 
       WHERE Issue_ID = ?`,
      [returnDateStr, id]
    );

    // 3. Critical business rule: Increase Available_Quantity back by Quantity
    await conn.query(
      'UPDATE EQUIPMENT SET Available_Quantity = Available_Quantity + ? WHERE Equipment_ID = ?',
      [issue.Quantity, issue.Equipment_ID]
    );

    // If new condition specified (e.g. Fair, Damaged, Poor), update it
    if (New_Condition) {
      await conn.query(
        'UPDATE EQUIPMENT SET `Condition` = ? WHERE Equipment_ID = ?',
        [New_Condition, issue.Equipment_ID]
      );
    }

    const createdFines = [];

    // 4. Critical business rule: Check for Late Return (> 7 days from Issue_Date)
    const issueDate = new Date(issue.Issue_Date);
    const returnDate = new Date(returnDateStr);
    const timeDiff = returnDate.getTime() - issueDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const ALLOWED_DAYS = 7;

    if (daysDiff > ALLOWED_DAYS) {
      const lateDays = daysDiff - ALLOWED_DAYS;
      const ratePerDay = 20.00; // Rs. 20 per late day
      const lateAmount = (lateDays * ratePerDay).toFixed(2);
      const lateReason = `Returned ${lateDays} day(s) late (exceeded ${ALLOWED_DAYS}-day loan period)`;

      const [fineRes] = await conn.query(
        'INSERT INTO FINE (Issue_ID, Amount, Reason, Status) VALUES (?, ?, ?, ?)',
        [id, lateAmount, lateReason, 'Unpaid']
      );
      createdFines.push({
        Fine_ID: fineRes.insertId,
        Amount: lateAmount,
        Reason: lateReason,
        Type: 'Late Fee'
      });
    }

    // 5. Critical business rule: Check for Damaged Equipment
    if (Is_Damaged || (New_Condition && New_Condition.toLowerCase() === 'damaged')) {
      const damageAmount = Damage_Cost ? parseFloat(Damage_Cost).toFixed(2) : (150.00).toFixed(2);
      const reasonDesc = Damage_Description 
        ? `Equipment returned damaged: ${Damage_Description}` 
        : 'Equipment returned in damaged condition';

      const [fineRes] = await conn.query(
        'INSERT INTO FINE (Issue_ID, Amount, Reason, Status) VALUES (?, ?, ?, ?)',
        [id, damageAmount, reasonDesc, 'Unpaid']
      );
      createdFines.push({
        Fine_ID: fineRes.insertId,
        Amount: damageAmount,
        Reason: reasonDesc,
        Type: 'Damage Fee'
      });
    }

    await conn.commit();

    // Fetch updated issue record
    const [updated] = await db.query(
      `SELECT 
        EI.*, 
        S.Name AS Student_Name, 
        E.Equipment_Name,
        E.Available_Quantity AS Current_Available_Quantity
       FROM EQUIPMENT_ISSUE EI
       JOIN STUDENT S ON EI.Student_ID = S.Student_ID
       JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
       WHERE EI.Issue_ID = ?`,
      [id]
    );

    res.json({
      message: 'Equipment returned successfully',
      issue: updated[0],
      finesCreated: createdFines
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error returning issue:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    conn.release();
  }
};
