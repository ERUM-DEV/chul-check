import { AttendanceType } from './index';

export interface IElectronAPI {
  // 인증
  checkPin: (pin: string) => Promise<boolean>;
  isAuthenticated: () => Promise<boolean>;
  login: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // 성도 관리
  getAllMembers: () => Promise<any[]>;
  addMember: (member: any) => Promise<any>;
  updateMember: (params: { id: string; field: string; value: any; oldValue: any }) => Promise<any>;
  
  // 출석 관리
  getTodayAttendance: (date: string) => Promise<any[]>;
  markAttendance: (memberId: string, date: string, type: AttendanceType) => Promise<any>;
  removeAttendance: (memberId: string, date: string) => Promise<any>;
  notifyLongAbsence: (memberId: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
} 