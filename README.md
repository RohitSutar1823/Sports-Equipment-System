# Sports Equipment Management System
**College DBMS Mini Project**  
*Tech Stack: MySQL 8.0 &bull; Node.js + Express &bull; React (Vite)*

---

## 📌 Project Overview
The **Sports Equipment Management System** is a computerized database application built to streamline sports inventory tracking, student issue/return transactions, sports facility reservations, academic schedule clash verification, equipment servicing, and fine penalties in college environments.

The database matches the project's official **ER Diagram and Relational Schema** exactly.

---

## 🗄️ Database Architecture (Exact Schema)

The MySQL database `sports_equipment_db` consists of 8 interconnected tables:

1. **`STUDENT`**: Stores student registration details (`Student_ID`, `Name`, `Department`, `Year`, `Phone`, `Email`).
2. **`SPORTS_FACILITY`**: Tracks sports grounds/courts (`Facility_ID`, `Facility_Name`, `Type`, `Location`, `Status`).
3. **`BOOKING`**: Manages facility reservations (`Booking_ID`, `Student_ID` FK, `Facility_ID` FK, `Date`, `Start_Time`, `End_Time`, `Purpose`, `Status`).
4. **`LECTURE_SCHEDULE`**: Student academic timetables (`Schedule_ID`, `Student_ID` FK, `Day`, `Subject`, `Start_Time`, `End_Time`).
5. **`EQUIPMENT`**: Inventory records (`Equipment_ID`, `Equipment_Name`, `Category`, `Total_Quantity`, `Available_Quantity`, ``Condition``).
6. **`EQUIPMENT_ISSUE`**: Equipment loans (`Issue_ID`, `Student_ID` FK, `Equipment_ID` FK, `Booking_ID` FK, `Issue_Date`, `Return_Date`, `Quantity`, `Status`).
7. **`MAINTENANCE`**: Equipment servicing and repair logs (`Maintenance_ID`, `Equipment_ID` FK, `Maintenance_Date`, `Description`, `Cost`, `Status`).
8. **`FINE`**: Late return and damage penalties (`Fine_ID`, `Issue_ID` FK, `Amount`, `Reason`, `Status`).

---

## ⚙️ Critical Business Logic Implemented

1. **Automatic Stock Decrement on Issue**:
   - When an `EQUIPMENT_ISSUE` is created, `EQUIPMENT.Available_Quantity` decreases by the issued `Quantity`.
   - Rejects the request with HTTP `400 Bad Request` if `Available_Quantity < Quantity`.
   - Executed within an atomic database transaction.

2. **Automatic Stock Replenishment on Return**:
   - When an issue is marked as returned (`Return_Date` set, `Status = 'Returned'`), `EQUIPMENT.Available_Quantity` increases back by that `Quantity`.

3. **Automated Fine Generation**:
   - **Late Return Penalty**: Loan window is 7 days. If returned after 7 days, an automatic `FINE` record is created (e.g. ₹20/day late).
   - **Damage Penalty**: If equipment is marked as damaged on return, an automatic `FINE` record is created with the damage reason and assessed repair cost.
   - Fine status defaults to `'Unpaid'` and can be toggled to `'Paid'` from the UI.

---

## 🚀 Quick Start Guide (Exact Commands)

### 1. Database Setup
Ensure MySQL Server 8.0 is running, then execute the schema and seed scripts using the MySQL command line or MySQL Workbench:

```bash
# Log in to MySQL and run schema + seed
mysql -u root -p
```
Inside the MySQL prompt:
```sql
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
```

*Or run directly in PowerShell / Command Prompt:*
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source backend/database/schema.sql; source backend/database/seed.sql;"
```

---

### 2. Backend Setup & Run

Open a terminal in the root folder:

```bash
cd backend
npm install
```

Configure your `.env` file (already configured for default local MySQL):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sports_equipment_db
```

Start the Express backend:
```bash
npm start
# Server starts at http://localhost:5000
```

---

### 3. Frontend Setup & Run

Open a **separate terminal** in the root folder:

```bash
cd frontend
npm install
npm run dev
# React Vite application runs at http://localhost:3000
```

Open your browser and visit:  
👉 **`http://localhost:3000`**

---

## 📡 REST API Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check |
| `/api/dashboard/stats` | `GET` | Summary metrics & counts |
| `/api/students` | `GET`, `POST` | List and register students |
| `/api/students/:id` | `GET`, `PUT`, `DELETE` | Student detail, update, delete |
| `/api/facilities` | `GET`, `POST` | List and register sports facilities |
| `/api/facilities/:id` | `GET`, `PUT`, `DELETE` | Facility detail, update, delete |
| `/api/bookings` | `GET`, `POST` | List and book facilities |
| `/api/bookings/:id` | `GET`, `PUT`, `DELETE` | Booking detail, status update, delete |
| `/api/equipment` | `GET`, `POST` | List and add equipment |
| `/api/equipment/:id` | `GET`, `PUT`, `DELETE` | Equipment detail, update, delete |
| `/api/issues` | `GET`, `POST` | List issues and issue equipment (decrements stock) |
| `/api/issues/:id` | `GET`, `PUT` | Return equipment (replenishes stock & computes fines) |
| `/api/maintenance` | `GET`, `POST` | List and log equipment maintenance |
| `/api/maintenance/:id` | `GET`, `PUT`, `DELETE` | Update status, delete maintenance record |
| `/api/fines` | `GET`, `POST` | List fines and create manual fine |
| `/api/fines/:id` | `GET`, `PUT`, `DELETE` | Mark fine as Paid / Unpaid |
| `/api/schedules` | `GET`, `POST` | List and add lecture schedules (`LECTURE_SCHEDULE`) |
| `/api/schedules/:id` | `GET`, `PUT`, `DELETE` | Schedule detail, update, delete |

---

## 🧪 Automated Testing

Run the included automated backend test suite to verify inventory decrement/increment and automated fine creation:

```bash
cd backend
node test_api.js
```

---

## 🎓 Academic Project Information
- **Project**: Sports Equipment Management System
- **Subject**: Database Management Systems (DBMS Mini Project)
- **Tech Stack**: MySQL 8.0 &bull; Node.js + Express &bull; React (Vite)
