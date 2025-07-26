
const { parseDateTime, getBufferedTimes, isWithinWorkingHours } = require('../utils/dateTimeUtility');
// Validate request data
const  validateEventData = (req, res, next)=>{
 
  const { title, startTime, endTime, participants } = req.body;

  // Validate required fields
  if (!title || !startTime || !endTime || !participants) {
    return res.status(400).json({
      error: "Missing required fields: title, startTime, endTime, participants"
    });
  }
  // Validate participants
  if (!Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({
      error: "Participants must be a non empty array"
    });
  }
  
  try {
    const start = parseDateTime(startTime);
    const end = parseDateTime(endTime);
    if (start >= end) {
      return res.status(400).json({
        error: "Start time must be before end time"
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: "Invalid date format. Use ISO 8601 format (e.g., 2024-01-15T10:00:00Z)"
    });
  }
  // Validate the event is with in working hours
  const { bufferedStart, bufferedEnd } = getBufferedTimes(startTime, endTime);
  if (!isWithinWorkingHours(bufferedStart, bufferedEnd)) {
    return res.status(400).json({
      error: 'Event time (including buffer) is outside working hours',
    });
  }
  
  next();
}
module.exports = validateEventData;