// In-memory data store
let bookings = [];
let events = [];
let nextId = 1;
let nextEventId = 1;

// Valid state transitions
const TRANSITIONS = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED', 'FAILED'],
  IN_PROGRESS: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: []
};

const TERMINAL_STATES = ['COMPLETED', 'CANCELLED', 'FAILED'];

export function createBooking(customerName, serviceType, scheduledTime) {
  const booking = {
    id: nextId++,
    customerName,
    serviceType,
    scheduledTime,
    status: 'PENDING',
    providerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  bookings.push(booking);
  
  logEvent({
    bookingId: booking.id,
    fromStatus: null,
    toStatus: 'PENDING',
    timestamp: booking.createdAt,
    metadata: { customerName, serviceType, scheduledTime }
  });
  
  return booking;
}

export function getBooking(id) {
  return bookings.find(b => b.id === id);
}

export function getAllBookings() {
  return [...bookings];
}

export function transitionBooking(id, newStatus, providerId = null, reason = null) {
  const booking = getBooking(id);
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  const currentStatus = booking.status;
  
  // Check if transition is valid
  if (!TRANSITIONS[currentStatus].includes(newStatus)) {
    throw new Error(
      `Invalid transition from ${currentStatus} to ${newStatus}. ` +
      `Valid transitions: ${TRANSITIONS[currentStatus].join(', ')}`
    );
  }
  
  // Update booking
  const oldStatus = booking.status;
  booking.status = newStatus;
  booking.updatedAt = new Date().toISOString();
  
  if (newStatus === 'ASSIGNED' && providerId) {
    booking.providerId = providerId;
  }
  
  // Log the transition event
  logEvent({
    bookingId: id,
    fromStatus: oldStatus,
    toStatus: newStatus,
    timestamp: booking.updatedAt,
    metadata: { providerId, reason }
  });
  
  return booking;
}

export function getBookingEvents(bookingId) {
  return events.filter(e => e.bookingId === bookingId);
}

export function getAllEvents() {
  return [...events];
}

function logEvent({ bookingId, fromStatus, toStatus, timestamp, metadata }) {
  const event = {
    id: nextEventId++,
    bookingId,
    fromStatus,
    toStatus,
    timestamp,
    metadata: metadata || {}
  };
  
  events.push(event);
  return event;
}

export function isTerminalState(status) {
  return TERMINAL_STATES.includes(status);
}