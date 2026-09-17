const db = require('../config/db');

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total equipment units & distinct equipment types
    const [equipmentStats] = await db.query(
      'SELECT COALESCE(SUM(Total_Quantity), 0) AS total_units, COALESCE(SUM(Available_Quantity), 0) AS available_units, COUNT(*) AS distinct_items FROM EQUIPMENT'
    );

    // 2. Items currently issued
    const [issuedStats] = await db.query(
      "SELECT COALESCE(SUM(Quantity), 0) AS items_currently_issued, COUNT(*) AS active_issues_count FROM EQUIPMENT_ISSUE WHERE Status = 'Issued'"
    );

    // 3. Active bookings (Confirmed)
    const [bookingStats] = await db.query(
      "SELECT COUNT(*) AS active_bookings FROM BOOKING WHERE Status = 'Confirmed'"
    );

    // 4. Pending / Unpaid fines
    const [fineStats] = await db.query(
      "SELECT COUNT(*) AS pending_fines_count, COALESCE(SUM(Amount), 0) AS pending_fines_amount FROM FINE WHERE Status = 'Unpaid'"
    );

    // 5. Total students & facilities
    const [studentStats] = await db.query('SELECT COUNT(*) AS total_students FROM STUDENT');
    const [facilityStats] = await db.query('SELECT COUNT(*) AS total_facilities FROM SPORTS_FACILITY');
    const [maintStats] = await db.query("SELECT COUNT(*) AS pending_maintenance FROM MAINTENANCE WHERE Status = 'Pending'");

    // 6. Recent issues (top 5)
    const [recentIssues] = await db.query(`
      SELECT 
        EI.Issue_ID,
        EI.Issue_Date,
        EI.Quantity,
        EI.Status,
        S.Name AS Student_Name,
        E.Equipment_Name
      FROM EQUIPMENT_ISSUE EI
      JOIN STUDENT S ON EI.Student_ID = S.Student_ID
      JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
      ORDER BY EI.Issue_ID DESC
      LIMIT 5
    `);

    // 7. Recent bookings (top 5)
    const [recentBookings] = await db.query(`
      SELECT 
        B.Booking_ID,
        B.Date,
        B.Start_Time,
        B.End_Time,
        B.Status,
        S.Name AS Student_Name,
        F.Facility_Name
      FROM BOOKING B
      JOIN STUDENT S ON B.Student_ID = S.Student_ID
      JOIN SPORTS_FACILITY F ON B.Facility_ID = F.Facility_ID
      ORDER BY B.Booking_ID DESC
      LIMIT 5
    `);

    // 8. Recent fines (top 5)
    const [recentFines] = await db.query(`
      SELECT 
        F.Fine_ID,
        F.Amount,
        F.Reason,
        F.Status,
        S.Name AS Student_Name,
        E.Equipment_Name
      FROM FINE F
      JOIN EQUIPMENT_ISSUE EI ON F.Issue_ID = EI.Issue_ID
      JOIN STUDENT S ON EI.Student_ID = S.Student_ID
      JOIN EQUIPMENT E ON EI.Equipment_ID = E.Equipment_ID
      ORDER BY F.Fine_ID DESC
      LIMIT 5
    `);

    res.json({
      totalEquipmentUnits: Number(equipmentStats[0].total_units),
      availableEquipmentUnits: Number(equipmentStats[0].available_units),
      distinctEquipmentCount: Number(equipmentStats[0].distinct_items),
      itemsCurrentlyIssued: Number(issuedStats[0].items_currently_issued),
      activeIssuesCount: Number(issuedStats[0].active_issues_count),
      activeBookings: Number(bookingStats[0].active_bookings),
      pendingFinesCount: Number(fineStats[0].pending_fines_count),
      pendingFinesAmount: Number(fineStats[0].pending_fines_amount),
      totalStudents: Number(studentStats[0].total_students),
      totalFacilities: Number(facilityStats[0].total_facilities),
      pendingMaintenance: Number(maintStats[0].pending_maintenance),
      recentIssues,
      recentBookings,
      recentFines
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
