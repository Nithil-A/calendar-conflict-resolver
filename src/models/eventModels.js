// In memory storage for events
let events = [
    {
    id: 1,
    title: "Team Meeting",
    startTime: "2025-07-28T10:00:00Z",
    endTime: "2025-07-28T11:00:00Z",
    participants: ["user1", "user2"]
  },
  {
    id: 2,
    title: "Client Call",
    startTime: "2024-01-15T14:00:00Z",
    endTime: "2024-01-15T15:00:00Z",
    participants: ["user1", "user3"]
  }
];

// Create a new event
const createEvent = (eventData) => {
    const newEvent = {
        id: events.length + 1, // Simple ID generation
        ...eventData
    };
    events.push(newEvent);
    return newEvent;
}

// Get all events
const getAllEvents = () => {
    return events;
}

module.exports = {
    getAllEvents,
    createEvent
};