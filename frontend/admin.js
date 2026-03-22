const ADMIN_PASSWORD = 'kristu123';

// ===== LOGIN =====
function adminLogin() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value;
  const err = document.getElementById('login-error');

  if (user === 'admin' && pass === ADMIN_PASSWORD) {
    sessionStorage.setItem('kj_admin', '1');
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminEvents();
  } else {
    err.textContent = '⚠ Invalid credentials.';
  }
}

function adminLogout() {
  sessionStorage.removeItem('kj_admin');
  location.reload();
}

document.getElementById('admin-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') adminLogin();
});

if (sessionStorage.getItem('kj_admin') === '1') {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  loadAdminEvents();
}

// ===== LOAD ALL EVENTS =====
async function loadAdminEvents() {
  const grid = document.getElementById('admin-events-grid');
  grid.innerHTML = '<div class="loading">Loading events...</div>';

  try {
    const res = await fetch(`${API_URL}/api/admin/events`);
    const events = await res.json();

    // Stats
    document.getElementById('total-count').textContent = events.length;
    document.getElementById('pending-count').textContent = events.filter(e => !e.approved).length;
    document.getElementById('approved-count').textContent = events.filter(e => e.approved).length;

    if (events.length === 0) {
      grid.innerHTML = '<div class="no-events">No events submitted yet.</div>';
      return;
    }

    grid.innerHTML = events.map(event => `
      <div class="event-card card">
        <div>${event.approved
          ? '<span class="approved-badge">✅ Approved</span>'
          : '<span class="pending-badge">⏳ Pending</span>'
        }</div>
        <div class="event-date">📅 ${formatDate(event.date)}</div>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description)}</p>
        <div class="admin-actions">
          ${!event.approved ? `<button class="approve-btn" onclick="approveEvent(${event.id})">✅ Approve</button>` : ''}
          <button class="delete-btn" onclick="deleteEvent(${event.id})">🗑 Delete</button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    grid.innerHTML = '<div class="no-events">❌ Could not load events. Make sure backend is running!</div>';
  }
}

// ===== APPROVE EVENT =====
async function approveEvent(id) {
  try {
    await fetch(`${API_URL}/api/admin/events/${id}/approve`, { method: 'PATCH' });
    loadAdminEvents();
  } catch (err) {
    alert('Error approving event!');
  }
}

// ===== DELETE EVENT =====
async function deleteEvent(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  try {
    await fetch(`${API_URL}/api/admin/events/${id}`, { method: 'DELETE' });
    loadAdminEvents();
  } catch (err) {
    alert('Error deleting event!');
  }
}
