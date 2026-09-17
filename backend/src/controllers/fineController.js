const db = require('../config/db');

// GET /api/fines
exports.getAllFines = async (req, res) => {
  try {
    const query = `
      SELECT 
        F.Fine_ID,
        F.Issue_ID,
        F.Amount,
        F.Reason,
        F.Status,
        EI.Student_ID,
        EI.Equipment_ID,
        EI.Issue_Date,
        EI.Return_Date,
        EI.Quantity,
        S.Name AS Student_Name,
        S.Department AS Student_Department,
        S.Phone AS Student_Phone,
        S.Email AS Student_Email,
        E.Equipment_Name
      FROM FINE F
      JOIN EQUIPMENT_ISSUE EI ON F.Issue_ID = EI.Issue_ID
      JOIN STUDENT S ON EI.Student_ID = S.Student_ID
      JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
      ORDER BY F.Fine_ID DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching fines:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// GET /api/fines/:id
exports.getFineById = async (req, res) => {
  try {
    const query = `
      SELECT 
        F.*,
        EI.Student_ID,
        EI.Equipment_ID,
        S.Name AS Student_Name,
        E.Equipment_Name
      FROM FINE F
      JOIN EQUIPMENT_ISSUE EI ON F.Issue_ID = EI.Issue_ID
      JOIN STUDENT S ON EI.Student_ID = S.Student_ID
      JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
      WHERE F.Fine_ID = ?
    `;
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Fine not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching fine:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// POST /api/fines - Manually create fine if required
exports.createFine = async (req, res) => {
  try {
    const { Issue_ID, Amount, Reason, Status } = req.body;

    if (!Issue_ID || Amount === undefined) {
      return res.status(400).json({ message: 'Issue ID and Amount are required.' });
    }

    const [issue] = await db.query('SELECT Issue_ID FROM EQUIPMENT_ISSUE WHERE Issue_ID = ?', [Issue_ID]);
    if (issue.length === 0) {
      return res.status(400).json({ message: 'Referenced equipment issue does not exist.' });
    }

    const [result] = await db.query(
      'INSERT INTO FINE (Issue_ID, Amount, Reason, Status) VALUES (?, ?, ?, ?)',
      [Issue_ID, parseFloat(Amount), Reason || null, Status || 'Unpaid']
    );

    const [newFine] = await db.query(
      `SELECT F.*, S.Name AS Student_Name, E.Equipment_Name
       FROM FINE F
       JOIN EQUIPMENT_ISSUE EI ON F.Issue_ID = EI.Issue_ID
       JOIN STUDENT S ON EI.Student_ID = S.Student_ID
       JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
       WHERE F.Fine_ID = ?`,
      [result.insertId]
    );

    res.status(201).json(newFine[0]);
  } catch (error) {
    console.error('Error creating fine:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// PUT /api/fines/:id - Update Fine (e.g. Mark as Paid)
exports.updateFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, Amount, Reason } = req.body;

    const [check] = await db.query('SELECT * FROM FINE WHERE Fine_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Fine record not found' });
    }

    const current = check[0];
    const newStatus = Status || current.Status;
    const newAmount = Amount !== undefined ? parseFloat(Amount) : current.Amount;
    const newReason = Reason !== undefined ? Reason : current.Reason;

    await db.query(
      'UPDATE FINE SET Status = ?, Amount = ?, Reason = ? WHERE Fine_ID = ?',
      [newStatus, newAmount, newReason, id]
    );

    const [updated] = await db.query(
      `SELECT F.*, S.Name AS Student_Name, E.Equipment_Name
       FROM FINE F
       JOIN EQUIPMENT_ISSUE EI ON F.Issue_ID = EI.Issue_ID
       JOIN STUDENT S ON EI.Student_ID = S.Student_ID
       JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
       WHERE F.Fine_ID = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating fine:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// DELETE /api/fines/:id
exports.deleteFine = async (req, res) => {
  try {
    const { id } = req.params;
    const [check] = await db.query('SELECT * FROM FINE WHERE Fine_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Fine record not found' });
    }

    await db.query('DELETE FROM FINE WHERE Fine_ID = ?', [id]);
    res.json({ message: 'Fine deleted successfully', fineId: Number(id) });
  } catch (error) {
    console.error('Error deleting fine:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
