export interface IElectronAPI {
  // 인증
  checkPin: (pin: string) => Promise<boolean>;
  
  // 성도 관리
  getMembers: () => Promise<Member[]>;
  addMember: (member: Omit<Member, 'id' | 'enable' | 'attendanceCount'>) => Promise<void>;
  updateMember: (id: string, field: keyof Member, value: any, oldValue: any) => Promise<void>;
  
  // 출석 관리
  markAttendance: (memberId: string, date: string, type: string) => Promise<{
    result: any;
    wasLongAbsent: boolean;
  }>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
} 