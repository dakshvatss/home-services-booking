import { useState, useEffect } from 'react';
import { 
  createBooking, 
  getAllBookings, 
  transitionBooking, 
  getBookingEvents,
  getAllEvents 
} from './api';

function App() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [error, setError] = useState(null);
  const [view, setView] = useState('bookings'); // 'bookings' or 'events'
  const [filterStatus, setFilterStatus] = useState('ALL'); // Filter bookings by status
  const [searchTerm, setSearchTerm] = useState(''); // Search bookings

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Transition state
  const [providerId, setProviderId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadBookings();
    loadAllEvents();
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      loadBookingEvents(selectedBooking.id);
    }
  }, [selectedBooking]);

  async function loadBookings() {
    try {
      const data = await getAllBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadBookingEvents(bookingId) {
    try {
      const data = await getBookingEvents(bookingId);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadAllEvents() {
    try {
      const data = await getAllEvents();
      setAllEvents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateBooking(e) {
    e.preventDefault();
    try {
      await createBooking(customerName, serviceType, scheduledTime);
      setCustomerName('');
      setServiceType('');
      setScheduledTime('');
      await loadBookings();
      await loadAllEvents();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTransition(bookingId, newStatus) {
    try {
      await transitionBooking(
        bookingId, 
        newStatus, 
        providerId || null, 
        reason || null
      );
      setProviderId('');
      setReason('');
      await loadBookings();
      await loadAllEvents();
      if (selectedBooking?.id === bookingId) {
        const updated = await getAllBookings();
        setSelectedBooking(updated.find(b => b.id === bookingId));
        await loadBookingEvents(bookingId);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function getValidTransitions(status) {
    const transitions = {
      PENDING: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['IN_PROGRESS', 'CANCELLED', 'FAILED'],
      IN_PROGRESS: ['COMPLETED', 'FAILED'],
      COMPLETED: [],
      CANCELLED: [],
      FAILED: []
    };
    return transitions[status] || [];
  }

  function formatMetadata(metadata) {
    if (!metadata || Object.keys(metadata).length === 0) return null;
    
    const parts = [];
    if (metadata.customerName) parts.push(`Customer: ${metadata.customerName}`);
    if (metadata.serviceType) parts.push(`Service: ${metadata.serviceType}`);
    if (metadata.scheduledTime) parts.push(`Scheduled: ${new Date(metadata.scheduledTime).toLocaleString()}`);
    if (metadata.providerId) parts.push(`Provider: ${metadata.providerId}`);
    if (metadata.reason) parts.push(`Reason: ${metadata.reason}`);
    
    return parts.length > 0 ? parts.join(' | ') : JSON.stringify(metadata);
  }

  function getBookingStats() {
    const stats = {
      PENDING: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      FAILED: 0
    };
    
    bookings.forEach(b => {
      stats[b.status] = (stats[b.status] || 0) + 1;
    });
    
    return stats;
  }

  function getStatusStyle(status) {
    const styles = {
      PENDING: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fff3e0', color: '#e65100', fontWeight: 'bold', fontSize: '0.9em' },
      ASSIGNED: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e1f5fe', color: '#01579b', fontWeight: 'bold', fontSize: '0.9em' },
      IN_PROGRESS: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f3e5f5', color: '#4a148c', fontWeight: 'bold', fontSize: '0.9em' },
      COMPLETED: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e8f5e9', color: '#1b5e20', fontWeight: 'bold', fontSize: '0.9em' },
      CANCELLED: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fce4ec', color: '#880e4f', fontWeight: 'bold', fontSize: '0.9em' },
      FAILED: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#ffebee', color: '#b71c1c', fontWeight: 'bold', fontSize: '0.9em' }
    };
    return styles[status] || {};
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Home Services Booking System</h1>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          marginBottom: '20px',
          border: '1px solid #ef5350',
          borderRadius: '4px'
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => setView('bookings')}
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'bookings' ? '#1976d2' : '#fff',
            color: view === 'bookings' ? '#fff' : '#000',
            border: '1px solid #1976d2',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Bookings ({bookings.length})
        </button>
        <button 
          onClick={() => setView('events')} 
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'events' ? '#1976d2' : '#fff',
            color: view === 'events' ? '#fff' : '#000',
            border: '1px solid #1976d2',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          All Events ({allEvents.length})
        </button>
        
        {view === 'bookings' && (
          <>
            <span style={{ marginLeft: '20px' }}>Filter:</span>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="FAILED">Failed</option>
            </select>
            <input
              type="text"
              placeholder="Search by customer or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                width: '250px',
                marginLeft: '10px'
              }}
            />
            {(filterStatus !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setFilterStatus('ALL');
                  setSearchTerm('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Clear Filters
              </button>
            )}
          </>
        )}
        
        <button
          onClick={() => {
            loadBookings();
            loadAllEvents();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {view === 'bookings' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            {/* Statistics Dashboard */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <h3 style={{ marginTop: 0 }}>Dashboard</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {Object.entries(getBookingStats()).map(([status, count]) => (
                  <div 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    style={{ 
                      padding: '10px', 
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      border: filterStatus === status ? '2px solid #1976d2' : '1px solid #ddd',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#1976d2' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '0.9em', marginTop: '5px' }}>
                      <span style={getStatusStyle(status)}>{status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h2>Create Booking</h2>
            <form onSubmit={handleCreateBooking}>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Service Type (e.g., Plumbing)"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  required
                  style={{ width: '100%', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                  style={{ width: '100%', padding: '5px' }}
                />
              </div>
              <button type="submit">Create Booking</button>
            </form>

            <h2 style={{ marginTop: '30px' }}>
              All Bookings 
              {(filterStatus !== 'ALL' || searchTerm) && (
                <span style={{ fontSize: '0.8em', color: '#666', fontWeight: 'normal' }}>
                  {' '}(filtered: {bookings.filter(b => 
                    (filterStatus === 'ALL' || b.status === filterStatus) &&
                    (!searchTerm || 
                      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      b.serviceType.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).length} of {bookings.length})
                </span>
              )}
            </h2>
            <div>
              {bookings
                .filter(booking => filterStatus === 'ALL' || booking.status === filterStatus)
                .filter(booking => 
                  !searchTerm || 
                  booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  booking.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(booking => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  style={{
                    padding: '10px',
                    marginBottom: '10px',
                    border: selectedBooking?.id === booking.id ? '2px solid #1976d2' : '1px solid #ddd',
                    cursor: 'pointer',
                    backgroundColor: selectedBooking?.id === booking.id ? '#e3f2fd' : '#fafafa',
                    borderRadius: '4px',
                    color: '#000'
                  }}
                >
                  <div><strong>ID:</strong> {booking.id}</div>
                  <div><strong>Customer:</strong> {booking.customerName}</div>
                  <div><strong>Service:</strong> {booking.serviceType}</div>
                  <div><strong>Status:</strong> <span style={getStatusStyle(booking.status)}>{booking.status}</span></div>
                  <div><strong>Scheduled:</strong> {new Date(booking.scheduledTime).toLocaleString()}</div>
                  {booking.providerId && <div><strong>Provider:</strong> {booking.providerId}</div>}
                </div>
              ))}
            </div>
          </div>

          <div>
            {selectedBooking ? (
              <>
                <h2>Booking #{selectedBooking.id} Details</h2>
                <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                  <div><strong>Customer:</strong> {selectedBooking.customerName}</div>
                  <div><strong>Service:</strong> {selectedBooking.serviceType}</div>
                  <div><strong>Status:</strong> {selectedBooking.status}</div>
                  <div><strong>Scheduled:</strong> {new Date(selectedBooking.scheduledTime).toLocaleString()}</div>
                  {selectedBooking.providerId && <div><strong>Provider:</strong> {selectedBooking.providerId}</div>}
                  <div><strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
                  <div><strong>Updated:</strong> {new Date(selectedBooking.updatedAt).toLocaleString()}</div>
                </div>

                <h3>State Transitions</h3>
                {getValidTransitions(selectedBooking.status).length > 0 ? (
                  <>
                    {getValidTransitions(selectedBooking.status).includes('ASSIGNED') && (
                      <div style={{ marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Provider ID"
                          value={providerId}
                          onChange={(e) => setProviderId(e.target.value)}
                          style={{ padding: '5px', marginRight: '10px' }}
                        />
                      </div>
                    )}
                    
                    {(getValidTransitions(selectedBooking.status).includes('CANCELLED') ||
                      getValidTransitions(selectedBooking.status).includes('FAILED')) && (
                      <div style={{ marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Reason (optional)"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          style={{ padding: '5px', width: '100%' }}
                        />
                      </div>
                    )}

                    {getValidTransitions(selectedBooking.status).map(status => (
                      <button
                        key={status}
                        onClick={() => handleTransition(selectedBooking.id, status)}
                        style={{ marginRight: '10px', marginBottom: '10px' }}
                      >
                        → {status}
                      </button>
                    ))}
                  </>
                ) : (
                  <p>No valid transitions (terminal state)</p>
                )}

                <h3 style={{ marginTop: '30px' }}>Event History</h3>
                <div>
                  {events.map(event => (
                    <div
                      key={event.id}
                      style={{
                        padding: '10px',
                        marginBottom: '5px',
                        border: '1px solid #ddd',
                        backgroundColor: '#fff9c4',
                        borderRadius: '4px',
                        borderLeft: '4px solid #f57f17',
                        color: '#000'
                      }}
                    >
                      <div>
                        <strong>
                          {event.fromStatus || 'START'} → {event.toStatus}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.9em', color: '#333' }}>
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      {Object.keys(event.metadata).length > 0 && (
                        <div style={{ fontSize: '0.9em', marginTop: '5px', color: '#000' }}>
                          {formatMetadata(event.metadata)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Select a booking to view details</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h2>All System Events</h2>
          <div>
            {allEvents.map(event => (
              <div
                key={event.id}
                style={{
                  padding: '10px',
                  marginBottom: '5px',
                  border: '1px solid #ddd',
                  backgroundColor: '#e1f5fe',
                  borderRadius: '4px',
                  borderLeft: '4px solid #0277bd',
                  color: '#000'
                }}
              >
                <div>
                  <strong>Booking #{event.bookingId}:</strong>{' '}
                  {event.fromStatus || 'START'} → {event.toStatus}
                </div>
                <div style={{ fontSize: '0.9em', color: '#333' }}>
                  {new Date(event.timestamp).toLocaleString()}
                </div>
                {Object.keys(event.metadata).length > 0 && (
                  <div style={{ fontSize: '0.9em', marginTop: '5px', color: '#000' }}>
                    {formatMetadata(event.metadata)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;