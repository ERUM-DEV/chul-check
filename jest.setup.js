require('@testing-library/jest-dom');

// Mock window.electronAPI
global.window.electronAPI = {
  markAttendance: jest.fn(),
  notifyLongAbsence: jest.fn(),
  isAuthenticated: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
}; 