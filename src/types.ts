export enum AttendanceType {
  WORSHIP = '예배만',
  CELL = '셀모임만',
  ALL = '전체',
  ABSENT = '결석'
}

export interface Member {
  id: string;
  group_name: string;
  name: string;
  birth_date: string | null;
  gender: string;
  joined_date: string;
  generation: string;
  roles: string[];
  recent_attendance_date: string | null;
  attendance_count: number;
  enable: number;
  long_absence: number;
  long_absence_reason: string | null;
  created_at: string;
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
  getAllMembers: () => Promise<Member[]>;
  addMember: (member: Omit<Member, 'id' | 'recent_attendance_date' | 'attendance_count' | 'enable' | 'created_at'>) => Promise<void>;
  updateMember: (id: string, field: keyof Member, value: any) => Promise<void>;
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