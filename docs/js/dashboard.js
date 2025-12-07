// dashboard.js - 대시보드 로직

let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  updateUserInfo();
  await loadAnnouncements();
  updateMenuVisibility();
});

function updateUserInfo() {
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
  
  const branch = CONFIG.BRANCHES[currentUser.branch];
  if (branch) {
    document.getElementById('userBranch').textContent = branch.name + ' - ' + branch.location;
  } else if (currentUser.branch === 'ALL') {
    document.getElementById('userBranch').textContent = 'All Branches';
  }
}

async function loadAnnouncements() {
  const listElement = document.getElementById('announcementList');
  
  try {
    const result = await API.getAnnouncements();
    
    if (result && result.success && result.data.announcements) {
      const announcements = result.data.announcements;
      
      if (announcements.length === 0) {
        listElement.innerHTML = '<div class="no-announcements">No announcements at this time</div>';
        return;
      }

      listElement.innerHTML = announcements.map(announcement => `
        <div class="announcement-item">
          <div class="announcement-header">
            <span class="announcement-branch">${announcement.branchName}</span>
            <span class="announcement-date">${announcement.created}</span>
          </div>
          <div class="announcement-message">${escapeHtml(announcement.message)}</div>
        </div>
      `).join('');

    } else {
      listElement.innerHTML = '<div class="no-announcements">Failed to load announcements</div>';
    }

  } catch (error) {
    console.error('Load announcements error:', error);
    listElement.innerHTML = '<div class="no-announcements">Error loading announcements</div>';
  }
}

function updateMenuVisibility() {
  const role = currentUser.role;

  if (role === CONFIG.ROLES.STAFF) {
    const salesCard = document.getElementById('salesCard');
    const payrollCard = document.getElementById('payrollCard');
    
    if (salesCard) salesCard.style.display = 'none';
  }
}

async function handleCheckIn() {
  if (!currentUser) return;

  if (!navigator.geolocation) {
    alert('Your browser does not support GPS location');
    return;
  }

  const checkInBtn = document.getElementById('checkinCard');
  checkInBtn.style.opacity = '0.6';
  checkInBtn.style.pointerEvents = 'none';

  try {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const result = await API.checkIn(currentUser.id, lat, lng);

        if (result && result.success) {
          alert('✅ ' + result.data.message);
          await loadAnnouncements();
        } else {
          alert('❌ ' + (result.message || 'Check-in failed'));
        }

        checkInBtn.style.opacity = '1';
        checkInBtn.style.pointerEvents = 'auto';
      },
      (error) => {
        console.error('GPS Error:', error);
        alert('Failed to get GPS location');
        checkInBtn.style.opacity = '1';
        checkInBtn.style.pointerEvents = 'auto';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

  } catch (error) {
    console.error('Check-in error:', error);
    alert('Check-in failed: ' + error.message);
    checkInBtn.style.opacity = '1';
    checkInBtn.style.pointerEvents = 'auto';
  }
}

async function handleCheckOut() {
  if (!currentUser) return;

  if (!confirm('Are you sure you want to check out?')) {
    return;
  }

  const checkOutBtn = document.getElementById('checkoutCard');
  checkOutBtn.style.opacity = '0.6';
  checkOutBtn.style.pointerEvents = 'none';

  try {
    const result = await API.checkOut(currentUser.id);

    if (result && result.success) {
      alert('✅ ' + result.data.message + '\nTotal hours: ' + result.data.totalHours);
    } else {
      alert('❌ ' + (result.message || 'Check-out failed'));
    }

  } catch (error) {
    console.error('Check-out error:', error);
    alert('Check-out failed: ' + error.message);
  } finally {
    checkOutBtn.style.opacity = '1';
    checkOutBtn.style.pointerEvents = 'auto';
  }
}

function goToPurchase() {
  alert('Purchase module - Coming soon!');
}

function goToSales() {
  if (currentUser.role === CONFIG.ROLES.STAFF) {
    alert('You do not have permission');
    return;
  }
  alert('Sales module - Coming soon!');
}

function goToAttendance() {
  alert('Attendance module - Coming soon!');
}

function goToPayroll() {
  alert('Payroll module - Coming soon!');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
