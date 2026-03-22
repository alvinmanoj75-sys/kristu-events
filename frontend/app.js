// ===== CONFIG =====
// Change this to your backend URL when deployed on Render
const API_URL = 'http://localhost:3000';

// ===== LOAD EVENTS =====
async function loadEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_URL}/api/events`);
    const events = await res.json();

    if (events.length === 0) {
      grid.innerHTML = '<div class="no-events">No upcoming events yet. Be the first to submit one! 🎉</div>';
      return;
    }

    grid.innerHTML = events.map(event => `
      <div class="event-card card">
        <div class="event-date">📅 ${formatDate(event.date)}</div>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description)}</p>
      </div>
    `).join('');

  } catch (err) {
    grid.innerHTML = '<div class="no-events">❌ Could not load events. Make sure the backend is running!</div>';
  }
}

// ===== SUBMIT EVENT FORM =====
const form = document.getElementById('eventForm');
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('form-status');

    const title = document.getElementById('title').value.trim();
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value.trim();

    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
      const res = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, description })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      status.textContent = '✅ Event submitted! Waiting for admin approval.';
      status.className = 'form-status success';
      form.reset();
    } catch (err) {
      status.textContent = `❌ Error: ${err.message}`;
      status.className = 'form-status error';
    } finally {
      btn.textContent = 'Submit Event →';
      btn.disabled = false;
    }
  });
}

// ===== HELPERS =====
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Load events on page load
loadEvents();
