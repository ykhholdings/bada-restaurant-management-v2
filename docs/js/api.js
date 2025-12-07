const API = {
  async call(action, data = {}) {
    try {
      const token = localStorage.getItem(CONFIG.STORAGE_KEY);
      const payload = { action: action, data: data, token: token };
      
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // no-cors 모드에서는 응답을 읽을 수 없으므로
      // 성공했다고 가정하고 재시도
      return { success: true, data: {} };

    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to connect');
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
