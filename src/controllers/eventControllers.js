const {getAllEvents} = require('../models/eventModels');
const {findConflicts, generateTimeSuggestions, createNewEventWithBuffer} = require("../services/eventServices");
const { getBufferedTimes, isWithinWorkingHours} = require("../utils/dateTimeUtility")

// Check conflict handler 
const checkConflictsHandler = async (req, res) => {
  
  try {
    const { startTime, endTime, participants } = req.body;
    
    const result = await findConflicts({ startTime, endTime, participants });
    return res.status(result.hasConflict ? 409 : 200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
// New time suggestion handler 
const suggestTimesHandler = async (req, res) => {
  try {
    const { startTime, endTime, participants } = req.body;
    
    const result = await generateTimeSuggestions({ startTime, endTime, participants });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
// Create new event handler
const createNewEventHandler = async (req, res) => {
  
  try {
    const { title, startTime, endTime, participants } = req.body;
    // Generate suggestions
    const suggestions = await generateTimeSuggestions({ startTime, endTime, participants });

    const { bufferedStart, bufferedEnd } = getBufferedTimes(startTime, endTime);

    if (!isWithinWorkingHours(bufferedStart, bufferedEnd)) {
      
      return res.status(400).json({
        message: 'Event time (including buffer) is outside working hours, Please choose a time from the suggestions',
        suggestions
      });
    }
    // check if the time has conflicts with existig events 
    const { hasConflict, conflicts } = await findConflicts({ startTime, endTime, participants });

    if (hasConflict) {

      return res.status(409).json({
        message: "Conflict detected with existing events",
        conflicts,
        suggestions
      });
    }
    // Create new event 
    const result = createNewEventWithBuffer({ title, startTime, endTime, participants });

    return res.status(201).json({
      message: "Event created successfully",
      event: result
    });

  } catch (error) {
    console.error("Error in createNewEventHandler:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
// Get all events handler 
const getAllEventsHandler = async (req, res) => {
  
  try {
    const events = getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
}

module.exports = {
  checkConflicts: checkConflictsHandler,
  suggestTimes: suggestTimesHandler,
  createNewEvent : createNewEventHandler,
  getAllEvents: getAllEventsHandler
};