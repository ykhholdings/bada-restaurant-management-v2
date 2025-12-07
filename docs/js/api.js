const API = {
  async call(action, data = {}) {
    try {
      const token = localStorage.getItem(CONFIG.STORAGE_KEY);
      const payload = { action: action, data: data, token: token };
      
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      if (!result.success && result.message && 
          result.message.includes('Invalid or expired session')) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        window.location.href = 'index.html';
        return null;
      }

      return result;

    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to connect to server');
    }
  },

  async login(email, password) {
    return await this.call('auth.login', { email, password });
  },

  async validateSession() {
    return await this.call('auth.validate');
  },

  async logout() {
    return await this.call('auth.logout');
  },

  async getAnnouncements() {
    return await this.call('announcement.list');
  },

  async createAnnouncement(branchId, message) {
    return await this.call('announcement.create', { branchId, message });
  },

  async updateAnnouncement(id, message) {
    return await this.call('announcement.update', { id, message });
  },

  async deleteAnnouncement(id) {
    return await this.call('announcement.update', { id, deactivate: true });
  },

  async checkIn(employeeId, gpsLat, gpsLng) {
    return await this.call('attendance.checkin', { employeeId, gpsLat, gpsLng });
  },

  async checkOut(employeeId) {
    return await this.call('attendance.checkout', { employeeId });
  },

  async getAttendance(employeeId, month, year) {
    return await this.call('attendance.list', { employeeId, month, year });
  }
};
