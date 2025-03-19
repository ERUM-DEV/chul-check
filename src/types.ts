export enum AttendanceType {
  ALL = '전체',
  WORSHIP = '예배만',
  CELL = '셀모임만',
  ABSENT = '결석'
}

export interface Member {
  id: string;
  name: string;
  groupName: string;
  gender: '남' | '여';
  generation: string;
  roles: string[];
  birthDate: string;
  joinedDate: string;
  longAbsence: boolean;
  longAbsenceReason?: string | null;
}

export interface Attendance {
  id: string;
  memberId: string;
  date: string;
  status: AttendanceType;
}

export interface AttendanceState {
  attendances: Attendance[];
  markAttendance: (memberId: string, date: string, type: AttendanceType) => Promise<{ wasLongAbsent: boolean }>;
  isLoading: boolean;
}

export interface ElectronAPI {
  markAttendance: (memberId: string, date: string, type: AttendanceType) => Promise<{ wasLongAbsent: boolean }>;
  notifyLongAbsence: (memberId: string) => Promise<void>;
  isAuthenticated: () => boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 