const config = require("../config/config")
// Parse data 
const parseDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid Date");
  }
  return date;
};
// Add buffer minutes to time
const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
}

const formatDateTime = (date)=> {
  return date.toISOString();
}
// Get buffered start and end time.  
const getBufferedTimes = (startTime, endTime) => {
  const start = parseDateTime(startTime);
  const end = parseDateTime(endTime);

  const bufferedStart = addMinutes(start, -config.bufferTimeMinutes);
  const bufferedEnd = addMinutes(end, config.bufferTimeMinutes);
  
  return { bufferedStart, bufferedEnd };
};
// Check the hours with in the working hours 
const isWithinWorkingHours = (startTime, endTime) => {
  try {
    
    const startHour = startTime.getUTCHours();
    const endHour = endTime.getUTCHours();
    const endMinutes = endTime.getUTCMinutes();
   
    // Check if start is within working hours
    if (startHour < config.workingHours.start || startHour >= config.workingHours.end) {
      return false;
    }
    
    // Check if end is within working hours (allow exact end time)
    if (endHour > config.workingHours.end || (endHour === config.workingHours.end && endMinutes > 0)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.log("Error in isWithinWorkingHours:", error);
    throw new Error("Error while checking working hours");
    
  }
}

module.exports = {
  parseDateTime,
    addMinutes,
    formatDateTime,
    getBufferedTimes,
    isWithinWorkingHours
};