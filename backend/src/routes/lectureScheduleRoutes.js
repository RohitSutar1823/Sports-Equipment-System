const express = require('express');
const router = express.Router();
const lectureScheduleController = require('../controllers/lectureScheduleController');

router.get('/', lectureScheduleController.getAllSchedules);
router.get('/:id', lectureScheduleController.getScheduleById);
router.post('/', lectureScheduleController.createSchedule);
router.put('/:id', lectureScheduleController.updateSchedule);
router.delete('/:id', lectureScheduleController.deleteSchedule);

module.exports = router;
