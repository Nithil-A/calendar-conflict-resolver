
# 📅 Calendar Conflict Resolver API

A Node.js + Express-based API to manage calendar events, detect scheduling conflicts between participants, and suggest alternative time slots.

---

## 🚀 Features

- Create events with buffer time checks
- Detect event time conflicts between participants
- Suggest available time slots automatically
- Respect working hours (9 AM – 5 PM UTC)
- Events stored in-memory (can be migrated to DB)

---

## 🧾 Folder Structure

```
calendar-conflict-resolver/
├── app.js                  # Express server entry point
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── src/
│   ├── config/
│   │   └── config.js           # Global config (buffer time, working hours)
│   ├── controllers/
│   │   └── eventController.js  # Route handlers
│   ├── middleware/
│   │   └── validateEvent.js    # Request body validation
│   ├── models/
│   │   └── eventModels.js      # In-memory event store
│   ├── routes/
│   │   └── eventRoutes.js      # API routes
│   ├── services/
│   │   └── eventServices.js    # Business logic: conflict & suggestion
│   └── utils/
│       └── dateTimeUtils.js    # Date parsing, formatting, buffer logic
```

---

## 🛠️ Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Nithil-A/calendar-conflict-resolver.git
cd calendar-conflict-resolver
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the server**
```bash
npm run dev   # for development using nodemon
npm start     # for normal start
```

4. **Server will run at:**  
```
http://localhost:3000
```

---

## 🌍 Time Format

- ⏰ All time inputs/outputs are in **UTC**.
- Example: `"2025-07-28T12:00:00Z"`

---

## 📬 API Endpoints

---

### 1. ✅ Create Event  
**POST** `/api/events`

**Request:**
```json
{
  "title": "New meeting",
  "startTime": "2025-07-28T12:00:00Z",
  "endTime": "2025-07-28T13:00:00Z",
  "participants": ["user1", "user2"]
}
```

**Response:**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": 3,
    "title": "New meeting",
    "startTime": "2025-07-28T12:00:00Z",
    "endTime": "2025-07-28T13:00:00Z",
    "participants": ["user1", "user2"]
  }
}
```

**cURL**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"New meeting","startTime":"2025-07-28T12:00:00Z","endTime":"2025-07-28T13:00:00Z","participants":["user1","user2"]}'
```

---

### 2. ❗ Check Conflicts  
**POST** `/api/check-conflict`

**Request:**
```json
{
  "title": "New meeting",
  "startTime": "2025-07-28T10:15:00Z",
  "endTime": "2025-07-28T11:15:00Z",
  "participants": ["user1"]
}
```

**Response (if conflict found):**
```json
{
  "hasConflict": true,
  "conflicts": [
    {
      "conflictingEvent": {
        "id": 1,
        "title": "Team Meeting",
        "startTime": "2025-07-28T10:00:00Z",
        "endTime": "2025-07-28T11:00:00Z",
        "participants": ["user1", "user2"]
      },
      "commonParticipants": ["user1"],
      "reason": "Time overlap with buffer time"
    }
  ]
}
```

**cURL**
```bash
curl -X POST http://localhost:3000/api/check-conflict \
  -H "Content-Type: application/json" \
  -d '{"title":"New meeting","startTime":"2025-07-28T10:15:00Z","endTime":"2025-07-28T11:15:00Z","participants":["user1"]}'
```

---

### 3. 🔁 Suggest Times  
**POST** `/api/suggest-times`

**Request:**
```json
{
  "title": "New meeting",
  "startTime": "2025-07-28T10:00:00Z",
  "endTime": "2025-07-28T11:00:00Z",
  "participants": ["user1"]
}
```

**Response:**
```json
[
  {
    "startTime": "2025-07-28T14:00:00.000Z",
    "endTime": "2025-07-28T15:00:00.000Z",
    "reason": "No conflicts"
  }
]
```

**cURL**
```bash
curl -X POST http://localhost:3000/api/suggest-times \
  -H "Content-Type: application/json" \
  -d '{"title":"New meeting","startTime":"2025-07-28T10:00:00Z","endTime":"2025-07-28T11:00:00Z","participants":["user1"]}'
```

---

### 4. 📋 Get All Events  
**GET** `/api/events`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Team Meeting",
    "startTime": "2025-07-28T10:00:00Z",
    "endTime": "2025-07-28T11:00:00Z",
    "participants": ["user1", "user2"]
  },
  {
    "id": 2,
    "title": "Client Call",
    "startTime": "2024-01-15T14:00:00Z",
    "endTime": "2024-01-15T15:00:00Z",
    "participants": ["user1", "user3"]
  }
]
```

**cURL**
```bash
curl http://localhost:3000/api/events
```

---

## 🧪 Test Case Scenarios

Use these example requests to test working hours validation and conflict detection.

### ✅ Sample Pre-Loaded Events
```js
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
```

### 🧪 1. Event Starts Before Working Hours (Should Fail)
**Time:** 08:00–09:00 UTC (before 9 AM)
```json
{
  "title": "Early Meeting",
  "startTime": "2025-07-28T08:00:00Z",
  "endTime": "2025-07-28T09:00:00Z",
  "participants": ["user1"]
}
```
**Expected:** `400 Bad Request` — "outside working hours"

---

### 🧪 2. Event Ends After Working Hours (Should Fail)
**Time:** 16:30–17:30 UTC (ends after 5 PM)
```json
{
  "title": "Late Review",
  "startTime": "2025-07-28T16:30:00Z",
  "endTime": "2025-07-28T17:30:00Z",
  "participants": ["user2"]
}
```
**Expected:** `400 Bad Request` — "outside working hours"

---

### 🧪 3. Conflict With Existing Event (Should Fail)
**Time:** 10:30–11:30 UTC (overlaps with Team Meeting)
```json
{
  "title": "Design Sync",
  "startTime": "2025-07-28T10:30:00Z",
  "endTime": "2025-07-28T11:30:00Z",
  "participants": ["user1"]
}
```
**Expected:** `409 Conflict` — overlaps with existing event

---

### 🧪 4. No Conflict, Valid Slot (Should Pass)
**Time:** 12:00–13:00 UTC
```json
{
  "title": "Marketing Call",
  "startTime": "2025-07-28T12:00:00Z",
  "endTime": "2025-07-28T13:00:00Z",
  "participants": ["user3"]
}
```
**Expected:** `201 Created`

---

### 🧪 5. Suggest Time for Conflict Slot
**Time:** 10:00–11:00 UTC (conflict)
```json
{
  "title": "Strategy Meeting",
  "startTime": "2025-07-28T10:00:00Z",
  "endTime": "2025-07-28T11:00:00Z",
  "participants": ["user1"]
}
```
**POST** `/api/suggest-times`

**Expected Response:**
```json
[
  {
    "startTime": "2025-07-28T14:00:00.000Z",
    "endTime": "2025-07-28T15:00:00.000Z",
    "reason": "No conflicts"
  }
]

---

## 📝 Notes

- Time is always handled in UTC (e.g., `2025-07-28T12:00:00Z`)
- Buffer time of 15 minutes is added before and after the event while checking conflicts
- Only 3 suggestions will be provided per request
- Working hours are limited to **9:00 – 17:00 UTC**

---

## 👨‍💻 Author

Made with ❤️ by [Nithil](https://github.com/Nithil-A)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE)
