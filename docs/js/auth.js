// auth.js - 인증 처리

document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (token) {
    validateAndRedirect();
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showAlert('Please enter both email and password', 'error');
    return;
  }

  const loginBtn = document.getElementById('loginBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  
  loginBtn.disabled = true;
  btnText.textContent = 'Logging in...';
  btnSpinner.classList.remove('hidden');

  try {
    const result = await API.login(email, password);

    if (result.success && result.data) {
      const userData = result.data;
      
      localStorage.setItem(CONFIG.STORAGE_KEY, userData.token);
      localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData.user));

      showAlert('Login successful! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);

    } else {
      showAlert(result.message || 'Invalid email or password', 'error');
      loginBtn.disabled = false;
      btnText.textContent = 'Login';
      btnSpinner.classList.add('hidden');
    }

  } catch (error) {
    console.error('Login error:', error);
    showAlert(error.message || 'Login failed', 'error');
    
    loginBtn.disabled = false;
    btnText.textContent = 'Login';
    btnSpinner.classList.add('hidden');
  }
}

async function validateAndRedirect() {
  try {
    const result = await API.validateSession();
    
    if (result && result.success) {
      window.location.href = 'dashboard.html';
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      localStorage.removeItem(CONFIG.USER_KEY);
    }
  } catch (error) {
    console.error('Session validation error:', error);
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
  }
}

function showAlert(message, type) {
  const alertBox = document.getElementById('alertBox');
  if (!alertBox) return;

  alertBox.textContent = message;
  alertBox.className = 'alert alert-' + type + ' show';

  setTimeout(() => {
    alertBox.classList.remove('show');
  }, 3000);
}

function getCurrentUser() {
  const userJson = localStorage.getItem(CONFIG.USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

async function logout() {
  try {
    await API.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    window.location.href = 'index.html';
  }
}
