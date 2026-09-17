const db = require('../config/db');

// GET /api/maintenance
exports.getAllMaintenance = async (req, res) => {
  try {
    const query = `
      SELECT 
        M.Maintenance_ID,
        M.Equipment_ID,
        M.Maintenance_Date,
        M.Description,
        M.Cost,
        M.Status,
        E.Equipment_Name,
        E.Category AS Equipment_Category
      FROM MAINTENANCE M
      JOIN EQUIPMENT E ON M.Equipment_ID = E.Equipment_ID
      ORDER BY M.Maintenance_Date DESC, M.Maintenance_ID DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// GET /api/maintenance/:id
exports.getMaintenanceById = async (req, res) => {
  try {
    const query = `
      SELECT 
        M.*,
        E.Equipment_Name,
        E.Category AS Equipment_Category
      FROM MAINTENANCE M
      JOIN EQUIPMENT E ON M.Equipment_ID = E.Equipment_ID
      WHERE M.Maintenance_ID = ?
    `;
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// POST /api/maintenance
exports.createMaintenance = async (req, res) => {
  try {
    const { Equipment_ID, Maintenance_Date, Description, Cost, Status } = req.body;

    if (!Equipment_ID || !Maintenance_Date) {
      return res.status(400).json({ message: 'Equipment and Maintenance Date are required.' });
    }

    const [equip] = await db.query('SELECT Equipment_ID FROM EQUIPMENT WHERE Equipment_ID = ?', [Equipment_ID]);
    if (equip.length === 0) {
      return res.status(400).json({ message: 'Selected equipment does not exist.' });
    }

    const costVal = Cost !== undefined ? parseFloat(Cost) : 0.00;

    const [result] = await db.query(
      'INSERT INTO MAINTENANCE (Equipment_ID, Maintenance_Date, Description, Cost, Status) VALUES (?, ?, ?, ?, ?)',
      [Equipment_ID, Maintenance_Date, Description || null, costVal, Status || 'Pending']
    );

    const [newRecord] = await db.query(
      `SELECT M.*, E.Equipment_Name, E.Category AS Equipment_Category
       FROM MAINTENANCE M
       JOIN EQUIPMENT E ON M.Equipment_ID = E.Equipment_ID
       WHERE M.Maintenance_ID = ?`,
      [result.insertId]
    );

    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// PUT /api/maintenance/:id
exports.updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { Equipment_ID, Maintenance_Date, Description, Cost, Status } = req.body;

    const [check] = await db.query('SELECT * FROM MAINTENANCE WHERE Maintenance_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    const current = check[0];
    const equipId = Equipment_ID || current.Equipment_ID;
    const mDate = Maintenance_Date || current.Maintenance_Date;
    const desc = Description !== undefined ? Description : current.Description;
    const costVal = Cost !== undefined ? parseFloat(Cost) : current.Cost;
    const statusVal = Status || current.Status;

    await db.query(
      'UPDATE MAINTENANCE SET Equipment_ID = ?, Maintenance_Date = ?, Description = ?, Cost = ?, Status = ? WHERE Maintenance_ID = ?',
      [equipId, mDate, desc, costVal, statusVal, id]
    );

    const [updated] = await db.query(
      `SELECT M.*, E.Equipment_Name, E.Category AS Equipment_Category
       FROM MAINTENANCE M
       JOIN EQUIPMENT E ON M.Equipment_ID = E.Equipment_ID
       WHERE M.Maintenance_ID = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// DELETE /api/maintenance/:id
exports.deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const [check] = await db.query('SELECT * FROM MAINTENANCE WHERE Maintenance_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    await db.query('DELETE FROM MAINTENANCE WHERE Maintenance_ID = ?', [id]);
    res.json({ message: 'Maintenance record deleted successfully', maintenanceId: Number(id) });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
