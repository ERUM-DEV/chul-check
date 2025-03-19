import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AttendanceCheck } from '../pages/AttendanceCheck';
import { AttendanceType, Member } from '../types';
import { useMemberStore } from '../store/useMemberStore';
import { useAttendanceStore } from '../store/useAttendanceStore';

// Mock the stores
jest.mock('../store/useMemberStore');
jest.mock('../store/useAttendanceStore');

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

describe('AttendanceCheck', () => {
  beforeEach(() => {
    (useMemberStore as jest.Mock).mockReturnValue({
      members: mockMembers
    });
    (useAttendanceStore as jest.Mock).mockReturnValue({
      markAttendance: jest.fn(),
      isLoading: false,
      attendances: []
    });
  });

  it('renders attendance check screen', () => {
    render(<AttendanceCheck />);
    expect(screen.getByText('출석체크')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이름으로 검색')).toBeInTheDocument();
    expect(screen.getByText('구역')).toBeInTheDocument();
  });

  it('displays member list', () => {
    render(<AttendanceCheck />);
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('1구역')).toBeInTheDocument();
    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.getByText('2구역')).toBeInTheDocument();
  });

  it('filters members by name', () => {
    render(<AttendanceCheck />);
    const searchInput = screen.getByPlaceholderText('이름으로 검색');
    fireEvent.change(searchInput, { target: { value: '홍길동' } });
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.queryByText('김철수')).not.toBeInTheDocument();
  });

  it('marks attendance for a member', () => {
    const mockMarkAttendance = jest.fn();
    (useAttendanceStore as jest.Mock).mockReturnValue({
      markAttendance: mockMarkAttendance,
      isLoading: false,
      attendances: []
    });

    render(<AttendanceCheck />);
    const attendanceButton = screen.getAllByText('예배만')[0];
    fireEvent.click(attendanceButton);
    expect(mockMarkAttendance).toHaveBeenCalledWith(expect.any(String), expect.any(String), AttendanceType.WORSHIP);
  });

  it('disables attendance buttons when loading', () => {
    (useAttendanceStore as jest.Mock).mockReturnValue({
      markAttendance: jest.fn(),
      isLoading: true,
      attendances: []
    });

    render(<AttendanceCheck />);
    const attendanceButtons = screen.getAllByRole('button');
    attendanceButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('highlights members with long absence', () => {
    render(<AttendanceCheck />);
    const longAbsentMember = screen.getByText('김철수').closest('tr');
    expect(longAbsentMember).toHaveClass('bg-red-100');
  });
}); 