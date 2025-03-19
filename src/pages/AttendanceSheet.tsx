import { useMemo, useState } from 'react';
import { useMemberStore } from '../store/useMemberStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { Select } from '../components/ui/Select';
import { AttendanceType } from '../types';

export function AttendanceSheet() {
  const { members } = useMemberStore();
  const { markAttendance } = useAttendanceStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState(new Date().getDate().toString().padStart(2, '0'));

  // 구역별로 멤버 그룹화
  const groupedMembers = useMemo(() => {
    const groups: { [key: string]: typeof members } = {};
    members.forEach(member => {
      if (!groups[member.groupName]) {
        groups[member.groupName] = [];
      }
      groups[member.groupName].push(member);
    });
    return groups;
  }, [members]);

  // 연도 옵션 생성 (현재 연도 기준 ±5년)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => ({
      value: (currentYear - 5 + i).toString(),
      label: `${currentYear - 5 + i}년`
    }));
  }, []);

  // 월 옵션 생성
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString().padStart(2, '0'),
      label: `${i + 1}월`
    }));
  }, []);

  // 일 옵션 생성
  const dayOptions = useMemo(() => {
    const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: (i + 1).toString().padStart(2, '0'),
      label: `${i + 1}일`
    }));
  }, [selectedYear, selectedMonth]);

  // 출석 체크 처리
  const handleAttendance = async (memberId: string) => {
    const date = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    try {
      await markAttendance(memberId, date, AttendanceType.WORSHIP);
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          {selectedYear}년 {selectedMonth}월 {selectedDay}일 청년부 명단
        </h1>
        <div className="flex gap-2">
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={yearOptions}
            className="w-32"
          />
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={monthOptions}
            className="w-24"
          />
          <Select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            options={dayOptions}
            className="w-24"
          />
        </div>
        <div className="ml-auto text-sm text-gray-500">
          To day {members.length} / {members.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">구분</th>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고집사 셀 ({i + 1}명)
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 10 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {rowIndex + 1}
                </td>
                {Array.from({ length: 10 }, (_, colIndex) => {
                  const member = Object.values(groupedMembers)[colIndex]?.[rowIndex];
                  return (
                    <td
                      key={colIndex}
                      className={`px-3 py-2 whitespace-nowrap text-sm ${member?.longAbsence ? 'bg-red-50' : ''
                        } cursor-pointer hover:bg-gray-50`}
                      onClick={() => member && handleAttendance(member.id)}
                    >
                      {member?.name || ''}
                      {member?.longAbsence && (
                        <span className="ml-1 text-xs text-red-500">●</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 