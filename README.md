# 🏟️ Sports Equipment Management System

![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=20232A)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-HTTP_Client-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

A full-stack web application for managing sports equipment, student issue and return transactions, sports facility bookings, maintenance records, lecture schedules, and fines.

This project was developed as a **Database Management Systems (DBMS) mini project** using MySQL, Node.js, Express.js, and React with Vite.

---

## ✨ Features

- 🏀 Sports equipment inventory management
- 👨‍🎓 Student registration and management
- 📦 Equipment issue and return tracking
- 📉 Automatic stock deduction when equipment is issued
- 📈 Automatic stock restoration when equipment is returned
- 🏟️ Sports facility booking management
- 🛠️ Equipment maintenance and repair records
- 💰 Automatic fine generation for late or damaged returns
- 📊 Dashboard statistics and summary information
- 🗓️ Lecture schedule management
- 🔌 REST API for all major operations
- 📱 Responsive and user-friendly React interface

---

## 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=20232A)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=FFD62E)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245?style=flat-square&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP_Client-5A29E4?style=flat-square&logo=axios&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

- React
- Vite
- React Router DOM
- Axios
- Lucide React
- CSS3

### Backend

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)
![REST API](https://img.shields.io/badge/API-REST-FF6F00?style=flat-square)

- Node.js
- Express.js
- MySQL2
- dotenv
- CORS
- Morgan

### Database

![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)

- MySQL 8.0
- Relational database design
- Foreign key relationships
- Transactions for inventory operations

---

## 📂 Project Structure

```text
Sports-Equipment-System/
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── test_api.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json
├── render.yaml
├── .gitignore
└── README.md
```

---

## 🗄️ Database Tables

The MySQL database contains the following main tables:

1. **STUDENT** – Student registration and contact information
2. **SPORTS_FACILITY** – Sports grounds, courts, and facility status
3. **BOOKING** – Facility reservation records
4. **LECTURE_SCHEDULE** – Student lecture timetable information
5. **EQUIPMENT** – Sports equipment inventory and availability
6. **EQUIPMENT_ISSUE** – Equipment loan and return records
7. **MAINTENANCE** – Equipment servicing and repair history
8. **FINE** – Late return and damage penalty records

---

## ⚙️ Business Logic

- Equipment availability is reduced when an item is issued.
- An issue is rejected when the requested quantity exceeds available stock.
- Equipment quantity is restored when an item is returned.
- Late returns can automatically generate fines.
- Damaged equipment can generate a fine based on the damage or repair cost.
- Inventory updates are handled using database transactions to maintain consistency.

---

## 🚀 Getting Started

### Prerequisites

Make sure the following software is installed:

- Node.js 18 or higher
- npm
- MySQL 8.0
- MySQL Workbench or MySQL command-line client

### 1. Clone the repository

```bash
git clone https://github.com/RohitSutar1823/Sports-Equipment-System.git
cd Sports-Equipment-System
```

### 2. Install dependencies

From the project root, run:

```bash
npm run install:all
```

You can also install dependencies separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure the database

Create the database and load the schema and sample data:

```bash
mysql -u root -p
```

Inside the MySQL prompt, run:

```sql
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
```

### 4. Configure environment variables

Create `backend/.env` using `backend/.env.example`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sports_equipment_db
```

### 5. Start the backend

```bash
npm run dev:backend
```

The backend API will run at:

```text
http://localhost:5000
```

### 6. Start the frontend

Open another terminal and run:

```bash
npm run dev:frontend
```

The frontend will run at:

```text
http://localhost:3000
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API status |
| `GET` | `/api/dashboard/stats` | Get dashboard statistics |
| `GET`, `POST` | `/api/students` | List or register students |
| `GET`, `PUT`, `DELETE` | `/api/students/:id` | Manage a student |
| `GET`, `POST` | `/api/facilities` | List or add facilities |
| `GET`, `PUT`, `DELETE` | `/api/facilities/:id` | Manage a facility |
| `GET`, `POST` | `/api/bookings` | List or create bookings |
| `GET`, `PUT`, `DELETE` | `/api/bookings/:id` | Manage a booking |
| `GET`, `POST` | `/api/equipment` | List or add equipment |
| `GET`, `PUT`, `DELETE` | `/api/equipment/:id` | Manage equipment |
| `GET`, `POST` | `/api/issues` | List or issue equipment |
| `GET`, `PUT` | `/api/issues/:id` | View or return equipment |
| `GET`, `POST` | `/api/maintenance` | List or add maintenance records |
| `GET`, `PUT`, `DELETE` | `/api/maintenance/:id` | Manage maintenance records |
| `GET`, `POST` | `/api/fines` | List or create fines |
| `GET`, `PUT`, `DELETE` | `/api/fines/:id` | Manage fine records |
| `GET`, `POST` | `/api/schedules` | List or add lecture schedules |
| `GET`, `PUT`, `DELETE` | `/api/schedules/:id` | Manage lecture schedules |

---

## 🧪 Testing

Run the backend API test script with:

```bash
cd backend
node test_api.js
```

The test script verifies important workflows such as equipment issue, equipment return, stock updates, and fine generation.

---

## 📦 Available Scripts

From the project root:

```bash
npm run install:all   # Install backend and frontend dependencies
npm run build         # Build the frontend application
npm start             # Start the backend server
npm run dev:backend   # Start the backend in development mode
npm run dev:frontend  # Start the frontend development server
```

---

## 🌐 Deployment

The repository includes a `render.yaml` file for deployment configuration with Render.

Before deploying, configure the required environment variables and connect the application to a production MySQL database.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push the branch
6. Open a pull request

---

## 👨‍💻 Author

**Rohit Sutar**

- GitHub: [@RohitSutar1823](https://github.com/RohitSutar1823)

---

## 📄 License

This project is licensed under the ISC License.

---

⭐ If you like this project, consider giving it a star!
