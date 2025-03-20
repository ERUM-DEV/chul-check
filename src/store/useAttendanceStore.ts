import { create } from 'zustand'
import { format } from 'date-fns'

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
  attendedMembers: Set<string>;

  // Actions
  markAttendance: (memberId: string, date: string, type: string) => Promise<void>;
  setCurrentEvent: (eventName: string) => void;
  fetchTodayAttendance: () => Promise<void>;
  removeAttendance: (memberId: string, date: string) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  currentEvent: null,
  totalAttendance: 0,
  isLoading: false,
  error: null,
  attendanceHistory: [],
  attendedMembers: new Set<string>(),

  fetchTodayAttendance: async () => {
    set({ isLoading: true, error: null });
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const records = await window.electronAPI.getTodayAttendance(today);
      set({ 
        attendedMembers: new Set(records.map((record: any) => record.member_id)),
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      set({ error: 'Failed to fetch attendance records', isLoading: false });
    }
  },

  markAttendance: async (memberId: string, date: string, type: string) => {
    set({ isLoading: true, error: null });
    try {
      await window.electronAPI.markAttendance(memberId, date, type);
      set(state => ({
        attendedMembers: new Set([...state.attendedMembers, memberId]),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error marking attendance:', error);
      set({ error: 'Failed to mark attendance', isLoading: false });
    }
  },

  setCurrentEvent: (eventName: string) => {
    set({ currentEvent: eventName })
  },

  removeAttendance: async (memberId: string, date: string) => {
    set({ isLoading: true, error: null });
    try {
      await window.electronAPI.removeAttendance(memberId, date);
      set(state => ({
        attendedMembers: new Set([...state.attendedMembers].filter(id => id !== memberId)),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error removing attendance:', error);
      set({ error: 'Failed to remove attendance', isLoading: false });
    }
  }
})) 