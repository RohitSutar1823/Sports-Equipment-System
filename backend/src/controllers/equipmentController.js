const db = require('../config/db');

// GET /api/equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT Equipment_ID, Equipment_Name, Category, Total_Quantity, Available_Quantity, `Condition` FROM EQUIPMENT ORDER BY Equipment_ID ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// GET /api/equipment/:id
exports.getEquipmentById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT Equipment_ID, Equipment_Name, Category, Total_Quantity, Available_Quantity, `Condition` FROM EQUIPMENT WHERE Equipment_ID = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching equipment item:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// POST /api/equipment
exports.createEquipment = async (req, res) => {
  try {
    const { Equipment_Name, Category, Total_Quantity, Available_Quantity, Condition } = req.body;

    if (!Equipment_Name || !Equipment_Name.trim()) {
      return res.status(400).json({ message: 'Equipment name is required' });
    }

    const total = parseInt(Total_Quantity, 10) || 0;
    // If available quantity is not explicitly provided, default it to total quantity
    const available = Available_Quantity !== undefined ? parseInt(Available_Quantity, 10) : total;
    const cond = Condition || 'Good';

    const [result] = await db.query(
      'INSERT INTO EQUIPMENT (Equipment_Name, Category, Total_Quantity, Available_Quantity, `Condition`) VALUES (?, ?, ?, ?, ?)',
      [Equipment_Name.trim(), Category || null, total, available, cond]
    );

    const [newEquip] = await db.query(
      'SELECT Equipment_ID, Equipment_Name, Category, Total_Quantity, Available_Quantity, `Condition` FROM EQUIPMENT WHERE Equipment_ID = ?',
      [result.insertId]
    );

    res.status(201).json(newEquip[0]);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// PUT /api/equipment/:id
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { Equipment_Name, Category, Total_Quantity, Available_Quantity, Condition } = req.body;

    const [check] = await db.query('SELECT * FROM EQUIPMENT WHERE Equipment_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const current = check[0];
    const name = Equipment_Name !== undefined ? Equipment_Name.trim() : current.Equipment_Name;
    const category = Category !== undefined ? Category : current.Category;
    const total = Total_Quantity !== undefined ? parseInt(Total_Quantity, 10) : current.Total_Quantity;
    const available = Available_Quantity !== undefined ? parseInt(Available_Quantity, 10) : current.Available_Quantity;
    const cond = Condition !== undefined ? Condition : current['Condition'];

    await db.query(
      'UPDATE EQUIPMENT SET Equipment_Name = ?, Category = ?, Total_Quantity = ?, Available_Quantity = ?, `Condition` = ? WHERE Equipment_ID = ?',
      [name, category, total, available, cond, id]
    );

    const [updated] = await db.query(
      'SELECT Equipment_ID, Equipment_Name, Category, Total_Quantity, Available_Quantity, `Condition` FROM EQUIPMENT WHERE Equipment_ID = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// DELETE /api/equipment/:id
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const [check] = await db.query('SELECT * FROM EQUIPMENT WHERE Equipment_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    await db.query('DELETE FROM EQUIPMENT WHERE Equipment_ID = ?', [id]);
    res.json({ message: 'Equipment deleted successfully', equipmentId: Number(id) });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Cannot delete equipment because issue history or maintenance logs reference it.'
      });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
