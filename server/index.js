import express from 'express';
import cors from 'cors';
import {
  createBooking,
  getBooking,
  getAllBookings,
  transitionBooking,
  getBookingEvents,
  getAllEvents
} from './store.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Create a new booking
app.post('/api/bookings', (req, res) => {
  try {
    const { customerName, serviceType, scheduledTime } = req.body;
    
    if (!customerName || !serviceType || !scheduledTime) {
      return res.status(400).json({ 
        error: 'customerName, serviceType, and scheduledTime are required' 
      });
    }
    
    const booking = createBooking(customerName, serviceType, scheduledTime);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  try {
    const bookings = getAllBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific booking
app.get('/api/bookings/:id', (req, res) => {
  try {
    const booking = getBooking(parseInt(req.params.id));
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transition a booking to a new state
app.post('/api/bookings/:id/transition', (req, res) => {
  try {
    const { newStatus, providerId, reason } = req.body;
    
    if (!newStatus) {
      return res.status(400).json({ error: 'newStatus is required' });
    }
    
    const booking = transitionBooking(
      parseInt(req.params.id),
      newStatus,
      providerId,
      reason
    );
    
    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get events for a specific booking
app.get('/api/bookings/:id/events', (req, res) => {
  try {
    const events = getBookingEvents(parseInt(req.params.id));
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events (for observability)
app.get('/api/events', (req, res) => {
  try {
    const events = getAllEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server status page
app.get('/', (req, res) => {
  const bookings = getAllBookings();
  const events = getAllEvents();
  
  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate event timeline data (events per hour for last 24 hours)
  const now = new Date();
  const eventsByHour = {};
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now - i * 60 * 60 * 1000);
    const hourKey = hour.getHours();
    eventsByHour[hourKey] = 0;
  }
  
  events.forEach(e => {
    const eventHour = new Date(e.timestamp).getHours();
    if (eventsByHour[eventHour] !== undefined) {
      eventsByHour[eventHour]++;
    }
  });
  
  // Calculate state transition counts
  const transitionCounts = {};
  events.forEach(e => {
    if (e.fromStatus && e.toStatus) {
      const key = `${e.fromStatus} → ${e.toStatus}`;
      transitionCounts[key] = (transitionCounts[key] || 0) + 1;
    }
  });
  
  const statusColors = {
    PENDING: '#e65100',
    ASSIGNED: '#01579b',
    IN_PROGRESS: '#4a148c',
    COMPLETED: '#1b5e20',
    CANCELLED: '#880e4f',
    FAILED: '#b71c1c'
  };
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Server Status Dashboard</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
      <style>
        body { font-family: sans-serif; padding: 20px; background: #f5f5f5; margin: 0; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #1976d2; margin-top: 0; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .stat { display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: #e3f2fd; border-radius: 4px; }
        .stat-label { font-size: 0.9em; color: #666; }
        .stat-value { font-size: 1.5em; font-weight: bold; color: #1976d2; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .chart-container { background: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
        .chart-container h3 { margin-top: 0; color: #333; }
        canvas { max-height: 300px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #1976d2; color: white; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 0.9em; font-weight: bold; }
        .PENDING { background: #fff3e0; color: #e65100; }
        .ASSIGNED { background: #e1f5fe; color: #01579b; }
        .IN_PROGRESS { background: #f3e5f5; color: #4a148c; }
        .COMPLETED { background: #e8f5e9; color: #1b5e20; }
        .CANCELLED { background: #fce4ec; color: #880e4f; }
        .FAILED { background: #ffebee; color: #b71c1c; }
        .refresh-btn { padding: 10px 20px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
        .refresh-btn:hover { background: #45a049; }
        .live-indicator { display: inline-block; width: 10px; height: 10px; background: #4caf50; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><span class="live-indicator"></span>Server Status Dashboard</h1>
          <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
        </div>
        <p style="color: #666;">API running on port ${PORT} | Last updated: ${new Date().toLocaleString()}</p>
        
        <h2>Quick Statistics</h2>
        <div class="stat">
          <div class="stat-label">Total Bookings</div>
          <div class="stat-value">${bookings.length}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Total Events</div>
          <div class="stat-value">${events.length}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Active (Non-Terminal)</div>
          <div class="stat-value">${bookings.filter(b => !['COMPLETED', 'CANCELLED', 'FAILED'].includes(b.status)).length}</div>
        </div>
        
        <div class="charts-grid">
          <div class="chart-container">
            <h3>📊 Bookings by Status</h3>
            <canvas id="statusChart"></canvas>
          </div>
          
          <div class="chart-container">
            <h3>🔄 State Transitions</h3>
            <canvas id="transitionsChart"></canvas>
          </div>
          
          <div class="chart-container">
            <h3>⏱️ Events Activity (Last 24h)</h3>
            <canvas id="timelineChart"></canvas>
          </div>
          
          <div class="chart-container">
            <h3>✅ Completion Rate</h3>
            <canvas id="completionChart"></canvas>
          </div>
        </div>
        
        <h2>Recent Bookings</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Status</th>
              <th>Scheduled</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.slice(-10).reverse().map(b => `
              <tr>
                <td>#${b.id}</td>
                <td>${b.customerName}</td>
                <td>${b.serviceType}</td>
                <td><span class="status ${b.status}">${b.status}</span></td>
                <td>${new Date(b.scheduledTime).toLocaleString()}</td>
                <td>${new Date(b.createdAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>API Endpoints</h2>
        <ul>
          <li><strong>POST</strong> /api/bookings - Create booking</li>
          <li><strong>GET</strong> /api/bookings - Get all bookings</li>
          <li><strong>GET</strong> /api/bookings/:id - Get booking by ID</li>
          <li><strong>POST</strong> /api/bookings/:id/transition - Transition booking state</li>
          <li><strong>GET</strong> /api/bookings/:id/events - Get booking events</li>
          <li><strong>GET</strong> /api/events - Get all events</li>
        </ul>
      </div>
      
      <script>
        // Status Distribution Chart
        new Chart(document.getElementById('statusChart'), {
          type: 'doughnut',
          data: {
            labels: ${JSON.stringify(Object.keys(statusCounts))},
            datasets: [{
              data: ${JSON.stringify(Object.values(statusCounts))},
              backgroundColor: ${JSON.stringify(Object.keys(statusCounts).map(s => statusColors[s]))},
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { position: 'right' }
            }
          }
        });
        
        // State Transitions Chart
        new Chart(document.getElementById('transitionsChart'), {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Object.keys(transitionCounts))},
            datasets: [{
              label: 'Transition Count',
              data: ${JSON.stringify(Object.values(transitionCounts))},
              backgroundColor: '#1976d2',
              borderColor: '#0d47a1',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
              }
            }
          }
        });
        
        // Timeline Chart
        new Chart(document.getElementById('timelineChart'), {
          type: 'line',
          data: {
            labels: ${JSON.stringify(Object.keys(eventsByHour).map(h => h + ':00'))},
            datasets: [{
              label: 'Events',
              data: ${JSON.stringify(Object.values(eventsByHour))},
              borderColor: '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
              }
            }
          }
        });
        
        // Completion Rate Chart
        const completed = ${statusCounts.COMPLETED || 0};
        const cancelled = ${statusCounts.CANCELLED || 0};
        const failed = ${statusCounts.FAILED || 0};
        const inProgress = ${bookings.length} - completed - cancelled - failed;
        
        new Chart(document.getElementById('completionChart'), {
          type: 'pie',
          data: {
            labels: ['Completed', 'In Progress', 'Failed', 'Cancelled'],
            datasets: [{
              data: [completed, inProgress, failed, cancelled],
              backgroundColor: ['#1b5e20', '#1976d2', '#b71c1c', '#880e4f'],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { position: 'right' }
            }
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});