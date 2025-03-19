import { useMemo } from 'react';
import { useMemberStore } from '../store/useMemberStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { Attendance } from '../types';

export function Dashboard() {
  const { members } = useMemberStore();
  const { attendances } = useAttendanceStore();

  // 구역별 통계
  const groupStats = useMemo(() => {
    const stats = new Map<string, { total: number; present: number; longAbsence: number }>();

    members.forEach(member => {
      const group = stats.get(member.groupName) || { total: 0, present: 0, longAbsence: 0 };
      group.total += 1;
      if (member.longAbsence) {
        group.longAbsence += 1;
      }
      stats.set(member.groupName, group);
    });

    // 출석 정보 반영
    const today = new Date().toISOString().split('T')[0];
    (attendances as Attendance[])
      .filter((a: Attendance) => a.date === today)
      .forEach((attendance: Attendance) => {
        const member = members.find(m => m.id === attendance.memberId);
        if (!member) return;

        const group = stats.get(member.groupName);
        if (group) {
          group.present += 1;
          stats.set(member.groupName, group);
        }
      });

    return Array.from(stats.entries()).map(([name, data]) => ({
      name,
      ...data,
      attendanceRate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));
  }, [members, attendances]);

  // 세대별 통계
  const generationStats = useMemo(() => {
    const stats = new Map<string, { total: number; present: number; longAbsence: number }>();

    members.forEach(member => {
      const generation = stats.get(member.generation) || { total: 0, present: 0, longAbsence: 0 };
      generation.total += 1;
      if (member.longAbsence) {
        generation.longAbsence += 1;
      }
      stats.set(member.generation, generation);
    });

    // 출석 정보 반영
    const today = new Date().toISOString().split('T')[0];
    (attendances as Attendance[])
      .filter((a: Attendance) => a.date === today)
      .forEach((attendance: Attendance) => {
        const member = members.find(m => m.id === attendance.memberId);
        if (!member) return;

        const generation = stats.get(member.generation);
        if (generation) {
          generation.present += 1;
          stats.set(member.generation, generation);
        }
      });

    return Array.from(stats.entries()).map(([name, data]) => ({
      name,
      ...data,
      attendanceRate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));
  }, [members, attendances]);

  // 월별 출석률 통계
  const monthlyStats = useMemo(() => {
    const stats: { month: string; rate: number }[] = [];
    const now = new Date();
    const uniqueAttendees = new Set<string>();

    // 최근 6개월 데이터 계산
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${targetDate.getMonth() + 1}`;

      // 해당 월의 출석자 수집
      uniqueAttendees.clear();
      (attendances as Attendance[]).forEach((attendance: Attendance) => {
        const attendanceDate = new Date(attendance.date);
        if (
          attendanceDate.getMonth() === targetDate.getMonth() &&
          attendanceDate.getFullYear() === targetDate.getFullYear()
        ) {
          uniqueAttendees.add(attendance.memberId);
        }
      });

      stats.push({
        month,
        rate: members.length > 0
          ? Math.round((uniqueAttendees.size / members.length) * 100)
          : 0
      });
    }

    return stats;
  }, [members, attendances]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">대시보드</h1>

      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600">{members.length}</div>
          <div className="text-sm text-gray-500">전체 성도</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">
            {(attendances as Attendance[]).filter((a: Attendance) => a.date === new Date().toISOString().split('T')[0]).length}
          </div>
          <div className="text-sm text-gray-500">출석 성도</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-red-600">
            {members.filter(m => m.longAbsence).length}
          </div>
          <div className="text-sm text-gray-500">장기 결석</div>
        </div>
      </div>

      {/* 구역별 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">구역별 현황</h2>
          <div className="space-y-4">
            {groupStats.map(stat => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{stat.name}</span>
                    <span className="text-sm text-gray-500">
                      {stat.present}/{stat.total} ({stat.attendanceRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stat.attendanceRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 세대별 현황 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">세대별 현황</h2>
          <div className="space-y-4">
            {generationStats.map(stat => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{stat.name}</span>
                    <span className="text-sm text-gray-500">
                      {stat.present}/{stat.total} ({stat.attendanceRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stat.attendanceRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 월별 출석 추이 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">월별 출석 추이</h2>
        <div className="text-sm text-gray-500 mb-4">최근 6개월 출석률 변화</div>
        <div className="grid grid-cols-6 gap-4">
          {monthlyStats.map(stat => (
            <div key={stat.month} className="flex flex-col items-center">
              <div className="text-sm text-gray-500">{stat.month}월</div>
              <div className="text-lg font-semibold">{stat.rate}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 