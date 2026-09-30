import axios from 'axios';

// Create Axios client. Uses relative '/api' in production (same-origin) and Vite proxy in dev
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dashboard
export const getDashboardStats = () => client.get('/dashboard/stats').then(res => res.data);

// Students
export const getStudents = () => client.get('/students').then(res => res.data);
export const getStudent = (id) => client.get(`/students/${id}`).then(res => res.data);
export const createStudent = (data) => client.post('/students', data).then(res => res.data);
export const updateStudent = (id, data) => client.put(`/students/${id}`, data).then(res => res.data);
export const deleteStudent = (id) => client.delete(`/students/${id}`).then(res => res.data);

// Facilities
export const getFacilities = () => client.get('/facilities').then(res => res.data);
export const getFacility = (id) => client.get(`/facilities/${id}`).then(res => res.data);
export const createFacility = (data) => client.post('/facilities', data).then(res => res.data);
export const updateFacility = (id, data) => client.put(`/facilities/${id}`, data).then(res => res.data);
export const deleteFacility = (id) => client.delete(`/facilities/${id}`).then(res => res.data);

// Bookings
export const getBookings = () => client.get('/bookings').then(res => res.data);
export const getBooking = (id) => client.get(`/bookings/${id}`).then(res => res.data);
export const createBooking = (data) => client.post('/bookings', data).then(res => res.data);
export const updateBooking = (id, data) => client.put(`/bookings/${id}`, data).then(res => res.data);
export const deleteBooking = (id) => client.delete(`/bookings/${id}`).then(res => res.data);

// Equipment
export const getEquipment = () => client.get('/equipment').then(res => res.data);
export const getEquipmentItem = (id) => client.get(`/equipment/${id}`).then(res => res.data);
export const createEquipment = (data) => client.post('/equipment', data).then(res => res.data);
export const updateEquipment = (id, data) => client.put(`/equipment/${id}`, data).then(res => res.data);
export const deleteEquipment = (id) => client.delete(`/equipment/${id}`).then(res => res.data);

// Issues & Returns
export const getIssues = () => client.get('/issues').then(res => res.data);
export const getIssue = (id) => client.get(`/issues/${id}`).then(res => res.data);
export const createIssue = (data) => client.post('/issues', data).then(res => res.data);
export const returnIssue = (id, data) => client.put(`/issues/${id}`, data).then(res => res.data);

// Maintenance
export const getMaintenance = () => client.get('/maintenance').then(res => res.data);
export const getMaintenanceItem = (id) => client.get(`/maintenance/${id}`).then(res => res.data);
export const createMaintenance = (data) => client.post('/maintenance', data).then(res => res.data);
export const updateMaintenance = (id, data) => client.put(`/maintenance/${id}`, data).then(res => res.data);
export const deleteMaintenance = (id) => client.delete(`/maintenance/${id}`).then(res => res.data);

// Fines
export const getFines = () => client.get('/fines').then(res => res.data);
export const getFine = (id) => client.get(`/fines/${id}`).then(res => res.data);
export const createFine = (data) => client.post('/fines', data).then(res => res.data);
export const updateFine = (id, data) => client.put(`/fines/${id}`, data).then(res => res.data);
export const deleteFine = (id) => client.delete(`/fines/${id}`).then(res => res.data);

// Lecture Schedules
export const getLectureSchedules = () => client.get('/schedules').then(res => res.data);
export const getLectureSchedule = (id) => client.get(`/schedules/${id}`).then(res => res.data);
export const createLectureSchedule = (data) => client.post('/schedules', data).then(res => res.data);
export const updateLectureSchedule = (id, data) => client.put(`/schedules/${id}`, data).then(res => res.data);
export const deleteLectureSchedule = (id) => client.delete(`/schedules/${id}`).then(res => res.data);
