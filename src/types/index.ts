// 성도 정보 타입
export interface Member {
  id: string;
  groupName: string;
  name: string;
  birthDate?: string;
  gender: 'M' | 'F';
  joinedDate: string;
  generation: string;
  roles: string[];
  recentAttendanceDate?: string;
  attendanceCount: number;
  enable: boolean;
  longAbsence: boolean;
  longAbsenceReason?: string;
}

// 출석 정보 타입
export interface Attendance {
  id: number;
  memberId: string;
  attendanceDate: string;
  attendanceType: '예배만' | '전체' | '셀모임만';
}

// 이력 정보 타입
export interface MemberHistory {
  id: number;
  memberId: string;
  changedField: string;
  oldValue?: string;
  newValue?: string;
  changedAt: string;
}

// 행사 정보 타입
export interface Event {
  id: number;
  name: string;
  eventDate: string;
}

// 필터 옵션 타입
export interface FilterOptions {
  searchText: string;
  groupFilter?: string;
  showLongAbsence: boolean;
  generationFilter?: string;
  roleFilter?: string;
} 