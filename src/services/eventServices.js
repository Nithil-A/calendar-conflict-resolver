const config = require("../config/config")
const { getAllEvents, createEvent } = require('../models/eventModels');
const { parseDateTime, addMinutes, formatDateTime, getBufferedTimes, isWithinWorkingHours } = require('../utils/dateTimeUtility');

// Check if time has overlap with existing events.
const hasTimeOverlap = (start1, end1, start2, end2, bufferMinutes = 0) =>{
  const bufferedEnd1 = addMinutes(end1, bufferMinutes);
  const bufferedStart1 = addMinutes(start1, -bufferMinutes);
  const bufferedEnd2 = addMinutes(end2, bufferMinutes);
  const bufferedStart2 = addMinutes(start2, -bufferMinutes);
  
  return bufferedStart1 < bufferedEnd2 && bufferedStart2 < bufferedEnd1;
}
// Find the conflict event from existing events
const findConflicts = async(proposedEvent) => {
  try {
    const conflicts = [];
    const proposedStart = parseDateTime(proposedEvent.startTime);
    const proposedEnd = parseDateTime(proposedEvent.endTime);

    // Check if the proposed event is within working hours
    const { bufferedStart, bufferedEnd } = getBufferedTimes(
      proposedEvent.startTime, 
      proposedEvent.endTime
    );

    if (!isWithinWorkingHours(bufferedStart, bufferedEnd)) {
      const suggestions = await generateTimeSuggestions(proposedEvent);
      return {
        hasConflict: true,
        reason: "Event time (including buffer) is outside working hours",
        suggestions
      }
      
    }
    //Get all existing events and check for conflicts
    const existingEvents = getAllEvents();
    for (const existingEvent of existingEvents) {
      const existingStart = parseDateTime(existingEvent.startTime);
      const existingEnd = parseDateTime(existingEvent.endTime);
      
      // Check for participant overlap
      const commonParticipants = proposedEvent.participants.filter(
        participant => existingEvent.participants.includes(participant)
      );

      if (commonParticipants.length > 0) {
        // Check for time overlap with buffer
        if (hasTimeOverlap(proposedStart, proposedEnd, existingStart, existingEnd, config.bufferTimeMinutes)) {
          conflicts.push({
            conflictingEvent: existingEvent,
            commonParticipants: commonParticipants,
            reason: "Time overlap with buffer time"
          });
        }
      }
    }
    
    return {
      hasConflict: conflicts.length > 0,
      conflicts
    };
  } catch (error) {
    console.log("Error in findConflicts:", error);
    throw new Error("Error while finding conflicts");
  }
  
}
// Generate new time slots 
const generateTimeSuggestions = async(proposedEvent) =>{
  try {
    const suggestions = [];
    const proposedStart = parseDateTime(proposedEvent.startTime);
    const proposedEnd = parseDateTime(proposedEvent.endTime);
    const duration = proposedEnd.getTime() - proposedStart.getTime();
    
    // Try different time slots
    const timeSlots = [
      // Try later on the same day
      addMinutes(proposedEnd, 30 + config.bufferTimeMinutes),
      // Try earlier on the same day
      addMinutes(proposedStart, -(duration / 60000) - config.bufferTimeMinutes),
      // Try 1 hour later
      addMinutes(proposedStart, 60),
      // Try 1 hour earlier
      addMinutes(proposedStart, -60),
      // Try 2 hours later
      addMinutes(proposedStart, 120),
      // Try 3 hours later
      addMinutes(proposedStart, 180),
      // Try 4 hours later
      addMinutes(proposedStart, 240),
    ];

    for (const newStartTime of timeSlots) {
      const newEndTime = new Date(newStartTime.getTime() + duration);
      const { bufferedStart, bufferedEnd } = getBufferedTimes(
        formatDateTime(newStartTime), 
        formatDateTime(newEndTime)
      );
      // Check if within working hours
      if (!isWithinWorkingHours(bufferedStart, bufferedEnd)) {
        continue;
      }
      
      // Create test event
      const testEvent = {
        ...proposedEvent,
        startTime: formatDateTime(newStartTime),
        endTime: formatDateTime(newEndTime)
      };
      
      // Check if this time has conflicts
      const {hasConflict, conflicts} = await findConflicts(testEvent);
      if (!hasConflict) {
        suggestions.push({
          startTime: formatDateTime(newStartTime),
          endTime: formatDateTime(newEndTime)
        });
        
        // Stop after finding 3 suggestions
        if (suggestions.length >= 3) {
          break;
        }
      }
    }
    
    return suggestions;
  } catch (error) {
    console.log("Error in generateTimeSuggestions:", error);
    throw new Error("Error while generating time suggestions");
  }
}
// Create new event 
const createNewEventWithBuffer = (proposedEvent)=> {
  try {
    const createdEvent = createEvent(proposedEvent);
    return createdEvent;

  } catch (error) {
    console.log("Error in createNewEventWithBuffer:", error);
    throw new Error("Error while creating new event with buffer time");
  }
};

module.exports = {
    hasTimeOverlap,
    findConflicts,
    generateTimeSuggestions,
    createNewEventWithBuffer
}