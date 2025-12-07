/*************************************************
 * app.js - BADA Management System (build v1)
 *************************************************/

console.log('BADA app.js loaded: build v1');

// Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbyQz2vsk5jPXOV5CEpIXvkWQ9LKMiD-KtqINGifyg672PTvsY48jWWaNN3I4qTRl6-S/exec';

/*************************************************
 * DOM Elements
 *************************************************/

const loginCard = document.getElementById('login-card');
const dashCard = document.getElementById('dash-card');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginBtnText = document.getElementById('login-btn-text');
const loginBtnSpinner = document.getElementById('login-btn-spinner');
const statusEl = document.getElementById('status');

const dashTitle = document.getElementById('dash-title');
const dashSubtitle = document.getElementById('dash-subtitle');
const roleBadge = document.getElementById('role-badge');
const buttonGrid = document.getElementById('button-grid');
const logoutBtn = document.getElementById('logout-btn');

const managerNote = document.getElementById('manager-note');
const managerNoteBody = document.getElementById('manager-note-body');

/*************************************************
 * Helpers
 *************************************************/

function setStatus(message, type = '') {
  statusEl.textContent = message || '';
  statusEl.classList.remove('error', 'success');
  if (type) statusEl.classList.add(type);
}

function setLoading(isLoading) {
  if (isLoading) {
    loginBtn.disabled = true;
    loginBtnSpinner.style.display = 'inline-block';
    loginBtnText.textContent = 'Logging in...';
    setStatus('');
  } else {
    loginBtn.disabled = false;
    loginBtnSpinner.style.display = 'none';
    loginBtnText.textContent = 'Log in';
  }
}

/**
 * API 호출 (CORS preflight 피하려고 text/plain 사용)
 */
async function callApi(payload) {
  console.log('Calling API with payload:', payload);

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      // ★ text/plain 으로 보내야 preflight 안 뜸
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log('Raw response text:', text);

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error('INVALID_JSON_RESPONSE');
  }

  if (!json.ok) {
    throw new Error(json.error || 'API_ERROR');
  }
  return json.data;
}

/*************************************************
 * Auth & Session
 *************************************************/

function saveSession(token, user) {
  localStorage.setItem('bada_token', token);
  localStorage.setItem('bada_user', JSON.stringify(user));
}

function getSession() {
  const token = localStorage.getItem('bada_token');
  const userStr = localStorage.getItem('bada_user');
  if (!token || !userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return { token, user };
  } catch (e) {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('bada_token');
  localStorage.removeItem('bada_user');
}

/*************************************************
 * UI Routing
 *************************************************/

function showLogin() {
  loginCard.classList.remove('hidden');
  dashCard.classList.add('hidden');
}

function showDashboard(session) {
  loginCard.classList.add('hidden');
  dashCard.classList.remove('hidden');

  const { user } = session;
  const role = user.role || 'STAFF';
  const branch = user.branch || '';

  dashTitle.textContent = `Welcome, ${user.name || 'User'}`;
  dashSubtitle.textContent =
    branch && branch !== 'ALL' ? `Branch: ${branch}` : 'All branches access';

  roleBadge.textContent = role;

  renderButtonsByRole(role);

  if (role === 'STAFF' || role === 'MANAGER') {
    managerNoteBody.textContent =
      'This is where your branch manager announcements will appear.';
    managerNote.classList.remove('hidden');
  } else {
    managerNote.classList.add('hidden');
  }
}

function renderButtonsByRole(role) {
  buttonGrid.innerHTML = '';

  const buttons = [];

  if (role === 'ADMIN') {
    buttons.push(
      { label: 'Purchases', desc: 'Manage branch purchase records & item prices' },
      { label: 'Sales', desc: 'Branch daily closing & reports' },
      { label: 'Attendance', desc: 'Staff check-in overview & approval' },
      { label: 'Payroll', desc: 'Salary calculation & monthly payouts' },
      { label: 'Users', desc: 'User accounts & permissions' },
      { label: 'Activity Log', desc: 'Full change history of the system' }
    );
  } else if (role === 'MANAGER') {
    buttons.push(
      { label: 'My Branch Sales', desc: 'View daily closing data & trends' },
      { label: 'My Branch Purchases', desc: 'Approve and review branch purchases' },
      { label: 'Attendance', desc: 'Approve staff attendance & half-days' },
      { label: 'Payroll', desc: 'View salary calculations for your team' },
      { label: 'Announcements', desc: 'Post messages for your staff' }
    );
  } else {
    // STAFF
    buttons.push(
      { label: 'Check-in / Check-out', desc: 'Register your attendance with GPS' },
      { label: 'My Attendance', desc: 'Review your working days this month' },
      { label: 'My Payroll', desc: 'See your calculated salary for each month' }
    );
  }

  buttons.forEach((btn) => {
    const el = document.createElement('button');
    el.className = 'big-btn';
    el.innerHTML = `
      ${btn.label}
      <span>${btn.desc}</span>
    `;
    el.addEventListener('click', () => {
      alert(`"${btn.label}" screen will be implemented next.`);
    });
    buttonGrid.appendChild(el);
  });
}

/*************************************************
 * Events
 *************************************************/

async function handleLoginClick() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    setStatus('Please enter both email and password.', 'error');
    return;
  }

  setLoading(true);
  try {
    const data = await callApi({
      action: 'login',
      email,
      password
    });

    saveSession(data.token, data.user);
    setStatus('Login successful.', 'success');
    showDashboard({ token: data.token, user: data.user });
  } catch (err) {
    console.error('Login error:', err);
    setStatus('Login failed: ' + (err.message || 'Unknown error'), 'error');
  } finally {
    setLoading(false);
  }
}

if (loginBtn) {
  loginBtn.addEventListener('click', handleLoginClick);
}

if (passwordInput) {
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleLoginClick();
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearSession();
    showLogin();
  });
}

/*************************************************
 * Init
 *************************************************/

(function init() {
  console.log('BADA app init');
  const session = getSession();
  if (session) {
    showDashboard(session);
  } else {
    showLogin();
  }
})();
