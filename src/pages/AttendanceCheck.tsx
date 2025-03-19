import { useMemo, useState } from 'react';
import { useMemberStore } from '../store/useMemberStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { AttendanceType } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

export function AttendanceCheck() {
  const { members } = useMemberStore();
  const { markAttendance, isLoading } = useAttendanceStore();
  const [nameFilter, setNameFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('전체');
  const [selectedType, setSelectedType] = useState<AttendanceType>(AttendanceType.ALL);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const nameMatch = member.name.includes(nameFilter);
      const groupMatch = groupFilter === '전체' || member.groupName === groupFilter;
      return nameMatch && groupMatch;
    });
  }, [members, nameFilter, groupFilter]);

  const groups = useMemo(() => {
    const uniqueGroups = new Set(members.map(m => m.groupName));
    return ['전체', ...Array.from(uniqueGroups)];
  }, [members]);

  const handleAttendance = async (memberId: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await markAttendance(memberId, today, selectedType);
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">출석체크</h1>

      <div className="flex gap-4 mb-6">
        <Input
          type="text"
          placeholder="이름으로 검색"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
          options={groups}
          label="구역 선택"
          className="max-w-xs"
        />
        <Select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value as AttendanceType)}
          options={Object.values(AttendanceType)}
          label="출석 유형"
          className="max-w-xs"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구역</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">세대</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직분</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">출석</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map(member => (
              <tr key={member.id} className={member.longAbsence ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.groupName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.generation}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.roles.join(', ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleAttendance(member.id)}
                    disabled={isLoading}
                  >
                    출석
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 