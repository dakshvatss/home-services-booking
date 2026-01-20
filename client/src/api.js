const API_BASE = 'http://localhost:3001/api';

export async function createBooking(customerName, serviceType, scheduledTime) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerName, serviceType, scheduledTime })
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  
  return res.json();
}

export async function getAllBookings() {
  const res = await fetch(`${API_BASE}/bookings`);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  
  return res.json();
}

export async function getBooking(id) {
  const res = await fetch(`${API_BASE}/bookings/${id}`);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  
  return res.json();
}

export async function transitionBooking(id, newStatus, providerId = null, reason = null) {
  const res = await fetch(`${API_BASE}/bookings/${id}/transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newStatus, providerId, reason })
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  
  return res.json();
}

export async function getBookingEvents(id) {
  const res = await fetch(`${API_BASE}/bookings/${id}/events`);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  
  return res.json();
}

export async function getAllEvents() {
  const res = await fetch(`${API_BASE}/events`);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  
  return res.json();
}