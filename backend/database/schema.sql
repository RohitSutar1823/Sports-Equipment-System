-- =======================================================
-- Sports Equipment Management System Database Schema
-- College DBMS Mini Project (Matches Project ER Diagram)
-- =======================================================

CREATE DATABASE IF NOT EXISTS sports_equipment_db;
USE sports_equipment_db;

-- 1. STUDENT Table
CREATE TABLE IF NOT EXISTS STUDENT (
    Student_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Department VARCHAR(100),
    Year VARCHAR(20),
    Phone VARCHAR(15),
    Email VARCHAR(100)
);

-- 2. SPORTS_FACILITY Table
CREATE TABLE IF NOT EXISTS SPORTS_FACILITY (
    Facility_ID INT AUTO_INCREMENT PRIMARY KEY,
    Facility_Name VARCHAR(100) NOT NULL,
    Type VARCHAR(50),
    Location VARCHAR(100),
    Status VARCHAR(20) DEFAULT 'Available'
);

-- 3. BOOKING Table
CREATE TABLE IF NOT EXISTS BOOKING (
    Booking_ID INT AUTO_INCREMENT PRIMARY KEY,
    Student_ID INT NOT NULL,
    Facility_ID INT NOT NULL,
    Date DATE NOT NULL,
    Start_Time TIME NOT NULL,
    End_Time TIME NOT NULL,
    Purpose VARCHAR(255),
    Status VARCHAR(20) DEFAULT 'Confirmed',
    FOREIGN KEY (Student_ID) REFERENCES STUDENT(Student_ID),
    FOREIGN KEY (Facility_ID) REFERENCES SPORTS_FACILITY(Facility_ID)
);

-- 4. LECTURE_SCHEDULE Table
CREATE TABLE IF NOT EXISTS LECTURE_SCHEDULE (
    Schedule_ID INT AUTO_INCREMENT PRIMARY KEY,
    Student_ID INT NOT NULL,
    Day VARCHAR(20),
    Subject VARCHAR(100),
    Start_Time TIME,
    End_Time TIME,
    FOREIGN KEY (Student_ID) REFERENCES STUDENT(Student_ID)
);

-- 5. EQUIPMENT Table
CREATE TABLE IF NOT EXISTS EQUIPMENT (
    Equipment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Equipment_Name VARCHAR(100) NOT NULL,
    Category VARCHAR(50),
    Total_Quantity INT NOT NULL DEFAULT 0,
    Available_Quantity INT NOT NULL DEFAULT 0,
    `Condition` VARCHAR(50) DEFAULT 'Good'
);

-- 6. EQUIPMENT_ISSUE Table
CREATE TABLE IF NOT EXISTS EQUIPMENT_ISSUE (
    Issue_ID INT AUTO_INCREMENT PRIMARY KEY,
    Student_ID INT NOT NULL,
    Equipment_ID INT NOT NULL,
    Booking_ID INT,
    Issue_Date DATE NOT NULL,
    Return_Date DATE,
    Quantity INT NOT NULL DEFAULT 1,
    Status VARCHAR(20) DEFAULT 'Issued',
    FOREIGN KEY (Student_ID) REFERENCES STUDENT(Student_ID),
    FOREIGN KEY (Equipment_ID) REFERENCES EQUIPMENT(Equipment_ID),
    FOREIGN KEY (Booking_ID) REFERENCES BOOKING(Booking_ID)
);

-- 7. MAINTENANCE Table
CREATE TABLE IF NOT EXISTS MAINTENANCE (
    Maintenance_ID INT AUTO_INCREMENT PRIMARY KEY,
    Equipment_ID INT NOT NULL,
    Maintenance_Date DATE NOT NULL,
    Description VARCHAR(255),
    Cost DECIMAL(10,2) DEFAULT 0.00,
    Status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (Equipment_ID) REFERENCES EQUIPMENT(Equipment_ID)
);

-- 8. FINE Table
CREATE TABLE IF NOT EXISTS FINE (
    Fine_ID INT AUTO_INCREMENT PRIMARY KEY,
    Issue_ID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Reason VARCHAR(255),
    Status VARCHAR(20) DEFAULT 'Unpaid',
    FOREIGN KEY (Issue_ID) REFERENCES EQUIPMENT_ISSUE(Issue_ID)
);
