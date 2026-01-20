# Home Services Booking System

A minimal but complete home-services marketplace focusing on booking lifecycle management, state transitions, failure handling, and observability.

## 🎯 Project Overview

This is a take-home assignment implementation that demonstrates:
- **Booking Lifecycle Management** - Complete CRUD operations for service bookings
- **State Machine Implementation** - Strict state transition rules with validation
- **Failure Handling** - Proper error handling for invalid transitions
- **Observability** - Event logging and history tracking for all state changes
- **Real-time Analytics** - Visual dashboard with charts and statistics

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + Express (ES Modules)
- **Frontend**: React (Vite)
- **Data Storage**: In-memory store
- **Charts**: Chart.js (server dashboard)

### Project Structure
```
home-services-booking/
├── server/
│   ├── index.js        # Express server & API routes
│   ├── store.js        # In-memory data store & business logic
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx     # Main React component
│   │   ├── api.js      # API client functions
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## 📊 Booking State Machine

### Valid States
- `PENDING` → `ASSIGNED` | `CANCELLED`
- `ASSIGNED` → `IN_PROGRESS` | `CANCELLED` | `FAILED`
- `IN_PROGRESS` → `COMPLETED` | `FAILED`
- Terminal states: `COMPLETED`, `CANCELLED`, `FAILED`

### State Transition Flow
```
PENDING ──→ ASSIGNED ──→ IN_PROGRESS ──→ COMPLETED
   │           │              │
   ↓           ↓              ↓
CANCELLED   CANCELLED      FAILED
   │           │
   ↓           ↓
FAILED      FAILED
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/home-services-booking.git
   cd home-services-booking
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

You need to run both the server and client in separate terminals.

**Terminal 1 - Start the Server:**
```bash
cd server
node index.js
```
Server will run on `http://localhost:3001`

**Terminal 2 - Start the Client:**
```bash
cd client
npm run dev
```
Client will run on `http://localhost:5173`

### Accessing the Application

- **Client UI**: http://localhost:5173
- **Server Dashboard**: http://localhost:3001
- **API Base URL**: http://localhost:3001/api

## 📋 Features

### Client Features (http://localhost:5173)
- ✅ Create new bookings with customer name, service type, and scheduled time
- ✅ View all bookings with filtering and search capabilities
- ✅ Filter bookings by status (PENDING, ASSIGNED, IN_PROGRESS, etc.)
- ✅ Search bookings by customer name or service type
- ✅ Interactive dashboard with booking statistics
- ✅ State transition buttons with validation
- ✅ Event history for each booking
- ✅ System-wide event log view
- ✅ Color-coded status badges
- ✅ Real-time data refresh

### Server Features (http://localhost:3001)
- ✅ Visual analytics dashboard with Chart.js
- ✅ Bookings distribution chart (doughnut)
- ✅ State transitions chart (bar)
- ✅ Events activity timeline (line)
- ✅ Completion rate analysis (pie)
- ✅ Recent bookings table
- ✅ API endpoints documentation
- ✅ Live status indicator

## 🔌 API Endpoints

### Bookings
- `POST /api/bookings` - Create a new booking
  ```json
  {
    "customerName": "John Doe",
    "serviceType": "Plumbing",
    "scheduledTime": "2026-01-25T10:00:00"
  }
  ```

- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get a specific booking
- `POST /api/bookings/:id/transition` - Transition booking state
  ```json
  {
    "newStatus": "ASSIGNED",
    "providerId": "PROV-123",
    "reason": "Optional reason for transition"
  }
  ```

### Events
- `GET /api/bookings/:id/events` - Get event history for a booking
- `GET /api/events` - Get all system events

## 🧪 Testing the Application

### Test Scenario 1: Happy Path
1. Create a new booking
2. Transition: `PENDING` → `ASSIGNED` (enter Provider ID: "PROV-123")
3. Transition: `ASSIGNED` → `IN_PROGRESS`
4. Transition: `IN_PROGRESS` → `COMPLETED`
5. Verify no more transitions available (terminal state)

### Test Scenario 2: Cancellation
1. Create a new booking
2. Transition: `PENDING` → `CANCELLED` (optional reason)
3. Verify terminal state reached

### Test Scenario 3: Failure Handling
1. Create a booking and assign it
2. Transition: `ASSIGNED` → `FAILED` (add reason: "Provider unavailable")
3. Verify terminal state and reason logged in events

### Test Scenario 4: Invalid Transition
1. Create a booking and complete the happy path
2. Try to transition from `COMPLETED` to any state
3. Verify error message appears

### Test Scenario 5: Filtering & Search
1. Create multiple bookings with different statuses
2. Use status filter dropdown to filter by status
3. Use search box to find specific customers or services
4. Click on dashboard stats to quick-filter
5. Verify filtered count displays correctly

### Test Scenario 6: Server Dashboard
1. Navigate to `http://localhost:3001`
2. Verify all charts display correctly
3. Create/transition bookings and refresh dashboard
4. Verify charts update with new data

## 🎨 Design Decisions

### Why In-Memory Storage?
- Simplifies setup and meets assignment requirements
- Focuses on business logic rather than infrastructure
- Easy to test and demonstrate

### Why No TypeScript?
- Assignment constraint to keep it minimal
- JavaScript allows faster prototyping
- Reduces build complexity

### Why Single Repo?
- Easier to clone and run
- Simpler dependency management
- Better for take-home assignments

### State Machine Validation
- Centralized in `store.js` for consistency
- Prevents invalid state transitions
- All transitions logged for audit trail

## 📝 Event Logging

Every state change is logged with:
- Event ID (auto-incrementing)
- Booking ID
- From Status → To Status
- Timestamp
- Metadata (provider ID, reason, etc.)

Events are immutable and provide complete audit trail.

## 🔒 Constraints & Limitations

As per assignment requirements:
- ❌ No authentication/authorization
- ❌ No payment processing
- ❌ No notifications/email
- ❌ No database (in-memory only)
- ❌ No TypeScript
- ❌ No Next.js
- ❌ Minimal styling (functional UI)

## 🐛 Known Issues

- Data resets when server restarts (in-memory storage)
- No pagination for large datasets
- No real-time updates (requires manual refresh)

## 🚀 Future Enhancements

If this were a production system:
- Add persistent database (PostgreSQL/MongoDB)
- Implement authentication & authorization
- Add real-time updates with WebSockets
- Implement notification system
- Add comprehensive test coverage
- Add API rate limiting
- Add input validation & sanitization
- Deploy to cloud (AWS/Vercel)

## 📄 License

This project is created for educational purposes as a take-home assignment.

## 👤 Author

Your Name
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

Built as a take-home assignment demonstrating:
- Clean code architecture
- State machine implementation
- Event-driven design patterns
- Full-stack development skills