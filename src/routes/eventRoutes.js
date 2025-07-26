const express = require('express');
const router = express.Router();
const validateEventData = require('../middleware/validateEvent');
const { checkConflicts, suggestTimes, createNewEvent, getAllEvents } = require('../controllers/eventControllers');

router.get('/events', getAllEvents);

router.post('/events', validateEventData, createNewEvent);

router.post('/check-conflict',validateEventData, checkConflicts);

router.post('/suggest-times',validateEventData, suggestTimes);

module.exports = router;