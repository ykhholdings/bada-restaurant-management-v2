// config.js - API 설정

const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxlKADi2k5QsqewZC8XolKX6csvIaS326YM966JIui6aK37237R9Ptw4Y7kboK8OScHLg/exec',
  
  STORAGE_KEY: 'bada_auth_token',
  USER_KEY: 'bada_user',
  
  BRANCHES: {
    'BR001': { name: 'BADA Restaurant', location: 'Al Barsha', coords: { lat: 25.0857, lng: 55.2094 } },
    'BR002': { name: 'Crazy Ramen', location: 'Al Ghurair', coords: { lat: 25.2697, lng: 55.3273 } },
    'BR003': { name: 'Crazy Ramen', location: 'Muraqqabat', coords: { lat: 25.2656, lng: 55.3220 } },
    'BR004': { name: 'Crazy Ramen', location: 'Burjuman', coords: { lat: 25.2529, lng: 55.3021 } }
  },
  
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff'
  }
};
