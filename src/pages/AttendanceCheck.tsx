import { useMemo, useState, useEffect } from 'react';
import { useMemberStore } from '../store/useMemberStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { AttendanceType } from '../types';
import { Input } from '../components/ui/Input';
import { Toast } from '../components/ui/Toast';
import { format } from 'date-fns';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export function AttendanceCheck() {
  const { members, fetchMembers, isLoading: membersLoading } = useMemberStore();
  const {
    markAttendance,
    removeAttendance,
    isLoading: attendanceLoading,
    attendedMembers,
    fetchTodayAttendance
  } = useAttendanceStore();

  const [nameFilter, setNameFilter] = useState('');
  const [selectedType] = useState<AttendanceType>(AttendanceType.ALL);
  const [highlightedGroup, setHighlightedGroup] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    console.log('AttendanceCheck: Fetching members and attendance...');
    Promise.all([
      fetchMembers(),
      fetchTodayAttendance()
    ]).catch((error) => {
      console.error('AttendanceCheck: Error fetching data:', error);
    });
  }, [fetchMembers, fetchTodayAttendance]);

  useEffect(() => {
    console.log('Current members:', members);
    console.log('Members loading:', membersLoading);
  }, [members, membersLoading]);

  const groupedMembers = useMemo(() => {
    console.log('Grouping members:', members);
    const groups = new Map<string, typeof members>();

    members.forEach(member => {
      if (!member.enable) return; // 비활성화된 멤버 제외

      const groupName = member.group_name?.trim() || '미정';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)?.push(member);
      console.log(`Added member ${member.name} to group ${groupName}`);
    });

    // Remove the "미정" group if it's empty
    if (groups.get('미정')?.length === 0) {
      groups.delete('미정');
    }

    console.log('Grouped members:', Object.fromEntries(groups));
    return groups;
  }, [members]);

  const groups = useMemo(() => {
    console.log('Creating groups list from:', groupedMembers);
    const groupList = Array.from(groupedMembers.keys());
    const sortedGroups = groupList.sort((a, b) => {
      // 셀 이름으로 정렬
      const aNum = a.replace(/[^0-9]/g, '');
      const bNum = b.replace(/[^0-9]/g, '');
      return parseInt(aNum) - parseInt(bNum);
    });

    console.log('Sorted groups:', sortedGroups);
    return sortedGroups;
  }, [groupedMembers]);

  const maxMembersInGroup = useMemo(() => {
    let max = 0;
    groupedMembers.forEach(members => {
      max = Math.max(max, members.length);
    });
    console.log('Max members in a group:', max);
    return max;
  }, [groupedMembers]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleAttendance = async (memberId: string, groupName: string) => {
    if (attendanceLoading) return;

    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      if (attendedMembers.has(memberId)) {
        await removeAttendance(memberId, selectedDate);
        showToast(`[${member.group_name || '미정'}] ${member.name}님의 출석이 취소되었습니다`, 'error');
      } else {
        await markAttendance(memberId, selectedDate, selectedType);
        showToast(`[${member.group_name || '미정'}] ${member.name}님이 출석하셨습니다`, 'success');
      }

      setHighlightedGroup(groupName);
      setTimeout(() => {
        setHighlightedGroup(null);
      }, 1000);
    } catch (error) {
      console.error('Failed to handle attendance:', error);
      showToast('오류가 발생했습니다', 'error');
    }
  };

  const handleNameSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && nameFilter.trim()) {
      const matchingMembers = members.filter(member =>
        member.enable && // 활성화된 멤버만
        member.name === nameFilter.trim() &&
        !attendedMembers.has(member.id)
      );

      for (const member of matchingMembers) {
        await handleAttendance(member.id, member.group_name || '미정');
      }

      setNameFilter('');
    }
  };

  if (membersLoading) {
    return (
      <div className="min-h-screen bg-[#1a1b1e] text-white flex items-center justify-center">
        <div className="text-xl">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1b1e] text-white flex items-center justify-center">
        <div className="text-xl">등록된 성도가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1b1e] text-white">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">출석체크</h1>

        <div className="flex flex-col gap-2 mb-6">
          <label htmlFor="nameSearch" className="text-sm font-medium">
            이름
          </label>
          <Input
            id="nameSearch"
            type="text"
            placeholder="이름으로 검색"
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            onKeyDown={handleNameSearch}
            className="max-w-xs bg-[#25262b] text-white border-gray-600"
          />
        </div>

        <div className="relative overflow-x-auto">
          <div className="max-w-full overflow-x-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  {groups.map(group => (
                    <th
                      key={group}
                      className={`
                        p-4 text-center border border-gray-600 bg-[#25262b] font-bold whitespace-nowrap
                        ${highlightedGroup === group ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
                      `}
                      style={{ minWidth: '120px' }}
                    >
                      {group}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxMembersInGroup }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {groups.map(group => {
                      const groupMembers = groupedMembers.get(group);
                      const member = groupMembers?.[rowIndex];

                      if (!member) {
                        return (
                          <td
                            key={group}
                            className="border border-gray-600 p-4 bg-[#1a1b1e]"
                            style={{ minWidth: '120px' }}
                          />
                        );
                      }

                      const isAttended = attendedMembers.has(member.id);
                      const isLongAbsent = member.long_absence === 1;

                      return (
                        <td
                          key={group}
                          onClick={() => handleAttendance(member.id, group)}
                          className={`
                            border border-gray-600 p-4 text-center cursor-pointer whitespace-nowrap
                            hover:bg-[#2c2d31]
                            ${isLongAbsent ? 'bg-red-900/50' : ''}
                            ${isAttended ? 'bg-green-900/50' : ''}
                          `}
                          style={{ minWidth: '120px' }}
                        >
                          {member.name}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 