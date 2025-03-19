import { create } from 'zustand'

export interface AttendanceRecord {
  memberId: string;
  date: string;
  type: '예배만' | '셀모임만' | '전체' | '결석';
}

interface AttendanceState {
  currentEvent: string | null;
  totalAttendance: number;
  isLoading: boolean;
  error: string | null;
  attendanceHistory: AttendanceRecord[];

  // Actions
  markAttendance: (memberId: string, date: string, type: AttendanceRecord['type']) => Promise<void>;
  setCurrentEvent: (eventName: string) => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  currentEvent: null,
  totalAttendance: 0,
  isLoading: false,
  error: null,
  attendanceHistory: [],

  markAttendance: async (memberId: string, date: string, type: AttendanceRecord['type'] = '전체') => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.markAttendance(memberId, date, type)
      
      // 출석 기록 업데이트
      const history = [...get().attendanceHistory];
      const existingIndex = history.findIndex(
        record => record.memberId === memberId && record.date === date
      );
      
      if (existingIndex >= 0) {
        history[existingIndex] = { memberId, date, type };
      } else {
        history.push({ memberId, date, type });
      }
      
      set({ attendanceHistory: history });
      
      if (result.wasLongAbsent) {
        // TODO: 장결 해제 알림 표시
      }
      
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  setCurrentEvent: (eventName: string) => {
    set({ currentEvent: eventName })
  },
})) 