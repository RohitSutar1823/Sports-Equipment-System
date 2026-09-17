const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');

router.get('/', fineController.getAllFines);
router.get('/:id', fineController.getFineById);
router.post('/', fineController.createFine);
router.put('/:id', fineController.updateFine);
router.delete('/:id', fineController.deleteFine);

module.exports = router;
