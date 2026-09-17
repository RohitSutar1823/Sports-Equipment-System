const db = require('../config/db');

// GET /api/facilities
exports.getAllFacilities = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SPORTS_FACILITY ORDER BY Facility_ID ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// GET /api/facilities/:id
exports.getFacilityById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SPORTS_FACILITY WHERE Facility_ID = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching facility:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// POST /api/facilities
exports.createFacility = async (req, res) => {
  try {
    const { Facility_Name, Type, Location, Status } = req.body;
    if (!Facility_Name || !Facility_Name.trim()) {
      return res.status(400).json({ message: 'Facility name is required' });
    }
    const [result] = await db.query(
      'INSERT INTO SPORTS_FACILITY (Facility_Name, Type, Location, Status) VALUES (?, ?, ?, ?)',
      [Facility_Name.trim(), Type || null, Location || null, Status || 'Available']
    );
    const [newFacility] = await db.query('SELECT * FROM SPORTS_FACILITY WHERE Facility_ID = ?', [result.insertId]);
    res.status(201).json(newFacility[0]);
  } catch (error) {
    console.error('Error creating facility:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// PUT /api/facilities/:id
exports.updateFacility = async (req, res) => {
  try {
    const { Facility_Name, Type, Location, Status } = req.body;
    const { id } = req.params;
    if (!Facility_Name || !Facility_Name.trim()) {
      return res.status(400).json({ message: 'Facility name is required' });
    }
    const [check] = await db.query('SELECT * FROM SPORTS_FACILITY WHERE Facility_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    await db.query(
      'UPDATE SPORTS_FACILITY SET Facility_Name = ?, Type = ?, Location = ?, Status = ? WHERE Facility_ID = ?',
      [Facility_Name.trim(), Type || null, Location || null, Status || 'Available', id]
    );
    const [updated] = await db.query('SELECT * FROM SPORTS_FACILITY WHERE Facility_ID = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating facility:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// DELETE /api/facilities/:id
exports.deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const [check] = await db.query('SELECT * FROM SPORTS_FACILITY WHERE Facility_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    await db.query('DELETE FROM SPORTS_FACILITY WHERE Facility_ID = ?', [id]);
    res.json({ message: 'Facility deleted successfully', facilityId: Number(id) });
  } catch (error) {
    console.error('Error deleting facility:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Cannot delete facility because existing bookings reference it.'
      });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
