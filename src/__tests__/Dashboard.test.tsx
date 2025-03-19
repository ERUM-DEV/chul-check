import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Dashboard } from '../pages/Dashboard';
import { useMemberStore } from '../store/useMemberStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { Member, Attendance, AttendanceType } from '../types';

// Mock the stores
jest.mock('../store/useMemberStore');
jest.mock('../store/useAttendanceStore');

describe('Dashboard', () => {
  const mockMembers: Member[] = [
    {
      id: '1',
      name: '홍길동',
      groupName: '1구역',
      gender: '남',
      generation: '1세대',
      roles: ['리더'],
      birthDate: '1990-01-01',
      joinedDate: '2020-01-01',
      longAbsence: false
    },
    {
      id: '2',
      name: '김철수',
      groupName: '2구역',
      gender: '남',
      generation: '2세대',
      roles: ['멤버'],
      birthDate: '1995-01-01',
      joinedDate: '2021-01-01',
      longAbsence: true,
      longAbsenceReason: '해외 출장'
    }
  ];

  const today = new Date().toISOString().split('T')[0];
  const mockAttendances: Attendance[] = [
    {
      id: '1',
      memberId: '1',
      date: today,
      status: AttendanceType.WORSHIP
    },
    {
      id: '2',
      memberId: '2',
      date: today,
      status: AttendanceType.ABSENT
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock store implementations
    (useMemberStore as unknown as jest.Mock).mockReturnValue({
      members: mockMembers
    });

    (useAttendanceStore as unknown as jest.Mock).mockReturnValue({
      attendances: mockAttendances
    });
  });

  it('renders dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText('대시보드')).toBeInTheDocument();
  });

  it('displays total statistics', () => {
    render(<Dashboard />);
    expect(screen.getByText('전체 멤버')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total members
    expect(screen.getByText('출석')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Attendance count
    expect(screen.getByText('장기결석')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Long absence count
  });

  it('displays group statistics', () => {
    render(<Dashboard />);
    expect(screen.getByText('1구역')).toBeInTheDocument();
    expect(screen.getByText('2구역')).toBeInTheDocument();
  });

  it('displays generation statistics', () => {
    render(<Dashboard />);
    expect(screen.getByText('1세대')).toBeInTheDocument();
    expect(screen.getByText('2세대')).toBeInTheDocument();
  });

  it('displays monthly trend chart', () => {
    render(<Dashboard />);
    expect(screen.getByText('월별 출석 현황')).toBeInTheDocument();
  });
}); 