-- =======================================================
-- Sports Equipment Management System Seed Data
-- Realistic College Sample Data for Demo & Evaluation
-- =======================================================

USE sports_equipment_db;

-- Clear existing data in reverse order of foreign keys
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE FINE;
TRUNCATE TABLE MAINTENANCE;
TRUNCATE TABLE EQUIPMENT_ISSUE;
TRUNCATE TABLE LECTURE_SCHEDULE;
TRUNCATE TABLE BOOKING;
TRUNCATE TABLE EQUIPMENT;
TRUNCATE TABLE SPORTS_FACILITY;
TRUNCATE TABLE STUDENT;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. STUDENT
INSERT INTO STUDENT (Student_ID, Name, Department, Year, Phone, Email) VALUES
(1, 'Aarav Sharma', 'Computer Engineering', 'TY', '9876543210', 'aarav.sharma@college.edu'),
(2, 'Neha Patel', 'Information Technology', 'TY', '9876543211', 'neha.patel@college.edu'),
(3, 'Karan Verma', 'Computer Engineering', 'TY', '9876543212', 'karan.verma@college.edu'),
(4, 'Pooja Rao', 'Mechanical Engineering', 'SY', '9876543213', 'pooja.rao@college.edu'),
(5, 'Aditya Joshi', 'Electronics Engineering', 'Final Year', '9876543214', 'aditya.j@college.edu'),
(6, 'Rhea Sen', 'Biomedical Engineering', 'FY', '9876543215', 'rhea.s@college.edu');

-- 2. SPORTS_FACILITY
INSERT INTO SPORTS_FACILITY (Facility_ID, Facility_Name, Type, Location, Status) VALUES
(1, 'Badminton Court 1', 'Indoor', 'Sports Complex - Hall A', 'Available'),
(2, 'Badminton Court 2', 'Indoor', 'Sports Complex - Hall A', 'Available'),
(3, 'Cricket Practice Pitch', 'Outdoor', 'Main College Ground - North', 'Available'),
(4, 'Basketball Court', 'Outdoor', 'East Campus Quad', 'Available'),
(5, 'Table Tennis Arena', 'Indoor', 'Gymkhana - 1st Floor', 'Available'),
(6, 'Football Turf', 'Outdoor', 'South Ground', 'Maintenance');

-- 3. EQUIPMENT
INSERT INTO EQUIPMENT (Equipment_ID, Equipment_Name, Category, Total_Quantity, Available_Quantity, `Condition`) VALUES
(1, 'Yonex Badminton Racket', 'Badminton', 20, 16, 'Good'),
(2, 'Feather Shuttlecock Barrel (6 pcs)', 'Badminton', 30, 26, 'Good'),
(3, 'English Willow Cricket Bat', 'Cricket', 10, 8, 'Good'),
(4, 'Leather Cricket Ball (Red)', 'Cricket', 25, 20, 'Good'),
(5, 'Spalding Basketball Size 7', 'Basketball', 15, 12, 'Good'),
(6, 'Stiga Table Tennis Racket', 'Table Tennis', 16, 12, 'Good'),
(7, '3-Star TT Balls (Pack of 6)', 'Table Tennis', 20, 18, 'Good'),
(8, 'Nike Strike Football Size 5', 'Football', 12, 10, 'Good'),
(9, 'Kashmir Willow Bat (Practice)', 'Cricket', 8, 7, 'Fair');

-- 4. BOOKING
INSERT INTO BOOKING (Booking_ID, Student_ID, Facility_ID, Date, Start_Time, End_Time, Purpose, Status) VALUES
(1, 1, 1, '2026-09-15', '16:00:00', '17:30:00', 'Inter-departmental badminton practice', 'Completed'),
(2, 2, 4, '2026-09-16', '17:00:00', '18:30:00', 'College team basketball drills', 'Completed'),
(3, 3, 3, '2026-09-18', '07:00:00', '09:00:00', 'Cricket net practice tournament prep', 'Confirmed'),
(4, 4, 5, '2026-09-18', '15:00:00', '16:00:00', 'Recreational Table Tennis match', 'Confirmed'),
(5, 5, 2, '2026-09-19', '11:00:00', '12:30:00', 'Girls singles badminton training', 'Confirmed');

-- 5. LECTURE_SCHEDULE
INSERT INTO LECTURE_SCHEDULE (Schedule_ID, Student_ID, Day, Subject, Start_Time, End_Time) VALUES
(1, 1, 'Monday', 'Database Management Systems', '09:00:00', '11:00:00'),
(2, 1, 'Wednesday', 'Operating Systems', '11:15:00', '13:15:00'),
(3, 2, 'Tuesday', 'Web Technologies', '10:00:00', '12:00:00'),
(4, 2, 'Thursday', 'Data Structures & Algorithms', '14:00:00', '16:00:00'),
(5, 3, 'Friday', 'Software Engineering', '09:00:00', '11:00:00'),
(6, 4, 'Wednesday', 'Thermodynamics', '11:00:00', '13:00:00');

-- 6. EQUIPMENT_ISSUE
-- Notice:
-- Issue 1: Returned on time (no fine)
-- Issue 2: Returned late (Issue_Date 2026-09-01, Return_Date 2026-09-15 = 14 days, fine created)
-- Issue 3: Currently Issued (Student 1, 2 Badminton Rackets)
-- Issue 4: Currently Issued (Student 2, 1 Cricket Bat)
-- Issue 5: Currently Issued (Student 3, 1 Basketball)
INSERT INTO EQUIPMENT_ISSUE (Issue_ID, Student_ID, Equipment_ID, Booking_ID, Issue_Date, Return_Date, Quantity, Status) VALUES
(1, 1, 1, 1, '2026-09-10', '2026-09-14', 2, 'Returned'),
(2, 4, 8, NULL, '2026-09-01', '2026-09-15', 1, 'Returned'),
(3, 1, 1, NULL, '2026-09-16', NULL, 2, 'Issued'),
(4, 2, 3, NULL, '2026-09-16', NULL, 1, 'Issued'),
(5, 3, 5, 2, '2026-09-17', NULL, 1, 'Issued');

-- 7. MAINTENANCE
INSERT INTO MAINTENANCE (Maintenance_ID, Equipment_ID, Maintenance_Date, Description, Cost, Status) VALUES
(1, 1, '2026-09-05', 'Restringing of broken racket strings and grip replacement', 350.00, 'Completed'),
(2, 8, '2026-09-12', 'Valve repair and bladder inflation test', 150.00, 'Completed'),
(3, 3, '2026-09-17', 'Handle re-binding and toe guard replacement', 400.00, 'Pending');

-- 8. FINE
-- Fine 1 generated from Issue 2 due to late return (7 days late @ Rs 20/day)
INSERT INTO FINE (Fine_ID, Issue_ID, Amount, Reason, Status) VALUES
(1, 2, 140.00, 'Late return by 7 days past allowed 7-day loan window', 'Unpaid');
