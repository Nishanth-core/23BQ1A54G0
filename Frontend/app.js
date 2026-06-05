const apiBase = 'http://localhost:3000/api/v1';
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const refreshButton = document.getElementById('refresh-button');
const markAllButton = document.getElementById('mark-all-button');
const createButton = document.getElementById('create-button');
const tokenPanel = document.getElementById('token-panel');
const notificationPanel = document.getElementById('notification-panel');
const tokenDisplay = document.getElementById('token-display');
const emailInput = document.getElementById('email');
const readFilter = document.getElementById('read-filter');
const notificationsList = document.getElementById('notifications-list');

let authToken = null;

function setAuth(token) {
  authToken = token;
  tokenDisplay.textContent = token;
  tokenPanel.hidden = false;
  notificationPanel.hidden = false;
}

function clearAuth() {
  authToken = null;
  tokenPanel.hidden = true;
  notificationPanel.hidden = true;
  tokenDisplay.textContent = '';
  notificationsList.innerHTML = '';
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${apiBase}${path}`, { ...options, headers });
  return res.json();
}

async function refreshNotifications() {
  const readValue = readFilter.value;
  const params = new URLSearchParams();
  if (readValue !== 'all') params.append('isRead', readValue);
  params.append('limit', '20');
  const response = await apiFetch(`/notifications?${params.toString()}`);
  if (!response.success) {
    console.error(response);
    return;
  }

  notificationsList.innerHTML = response.data
    .map((notif) => {
      const readClass = notif.isRead ? '' : 'unread';
      return `
      <li class="notification-item ${readClass}">
        <strong>${notif.title}</strong>
        <p>${notif.message}</p>
        <small>${new Date(notif.createdAt).toLocaleString()}</small>
        <div class="notification-footer">
          <span>${notif.type}</span>
          <span>Read: ${notif.isRead}</span>
          <button data-id="${notif.id}" class="mark-read-button">Mark Read</button>
          <button data-id="${notif.id}" class="delete-button">Delete</button>
        </div>
      </li>`;
    })
    .join('');
}

loginButton.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  if (!email) return alert('Email is required');
  const result = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email }) });
  if (!result.success) return alert(result.error.message || 'Login failed');
  setAuth(result.data.token);
  refreshNotifications();
});

logoutButton.addEventListener('click', () => {
  clearAuth();
});

refreshButton.addEventListener('click', refreshNotifications);
markAllButton.addEventListener('click', async () => {
  const result = await apiFetch('/notifications/read-all', { method: 'PATCH', body: JSON.stringify({}) });
  if (result.success) {
    refreshNotifications();
  } else {
    alert(result.error.message || 'Failed to mark all read');
  }
});

createButton.addEventListener('click', async () => {
  const title = document.getElementById('title').value.trim();
  const message = document.getElementById('message').value.trim();
  const type = document.getElementById('type').value;
  if (!title || !message) return alert('Title and message are required');

  const result = await apiFetch('/notifications', {
    method: 'POST',
    body: JSON.stringify({ title, message, type }),
  });

  if (result.success) {
    alert('Notification created');
    refreshNotifications();
  } else {
    alert(result.error.message || 'Create failed');
  }
});

notificationsList.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('.delete-button');
  const markReadButton = event.target.closest('.mark-read-button');
  if (deleteButton) {
    const id = deleteButton.dataset.id;
    const result = await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    if (result.success) refreshNotifications();
    else alert(result.error.message || 'Delete failed');
  }
  if (markReadButton) {
    const id = markReadButton.dataset.id;
    const result = await apiFetch(`/notifications/${id}/read`, { method: 'PATCH', body: JSON.stringify({ isRead: true }) });
    if (result.success) refreshNotifications();
    else alert(result.error.message || 'Update failed');
  }
});

clearAuth();
