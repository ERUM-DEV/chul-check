// 렌더러 프로세스의 JavaScript 코드
document.addEventListener('DOMContentLoaded', async () => {
    // 아이템 목록 가져오기
    const items = await window.electronAPI.getItems()
    console.log('Current items:', items)

    // 새 아이템 추가 예시
    const result = await window.electronAPI.addItem('Test Item')
    console.log('Added new item:', result)
})

// 날짜 포맷팅 함수
function formatDate(date) {
    return new Date(date).toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit'
    });
}

// 최근 4주 날짜 생성
function getRecentSundays() {
    const sundays = [];
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? 0 : 7);
    
    for (let i = 0; i < 4; i++) {
        const sunday = new Date(today.setDate(diff - (7 * i)));
        sundays.unshift(sunday.toISOString().split('T')[0]);
    }
    
    return sundays;
}

// 출석 상태 토글
async function toggleAttendance(memberId, date, currentState) {
    try {
        if (currentState) {
            await window.electronAPI.removeAttendance(memberId, date);
        } else {
            await window.electronAPI.markAttendance(memberId, date);
        }
        await refreshAttendanceTable();
    } catch (error) {
        console.error('출석 처리 중 오류:', error);
        alert('출석 처리 중 오류가 발생했습니다.');
    }
}

// 출석부 테이블 새로고침
async function refreshAttendanceTable() {
    const members = await window.electronAPI.getMembers();
    const sundays = getRecentSundays();
    
    // 날짜 헤더 업데이트
    const dateHeaders = document.getElementById('dateHeaders');
    dateHeaders.innerHTML = sundays.map(date => 
        `<th class="attendance-cell">${formatDate(date)}</th>`
    ).join('');
    
    // 멤버 목록 업데이트
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = members.map(member => {
        const attendanceDates = member.attendance_dates ? member.attendance_dates.split(',') : [];
        
        const attendanceCells = sundays.map(date => {
            const isPresent = attendanceDates.includes(date);
            return `
                <td class="attendance-cell">
                    <i class="attendance-check fas fa-${isPresent ? 'check text-success' : 'times text-danger'}"
                       onclick="toggleAttendance('${member.id}', '${date}', ${isPresent})"></i>
                </td>
            `;
        }).join('');
        
        return `
            <tr>
                <td>${member.name}</td>
                <td>${new Date(member.birthdate).toLocaleDateString('ko-KR')}</td>
                <td>${member.cell}</td>
                <td>${member.cell_leader}</td>
                ${attendanceCells}
            </tr>
        `;
    }).join('');
}

// 새 멤버 추가 폼 처리
document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const member = {
        name: document.getElementById('name').value,
        birthdate: document.getElementById('birthdate').value,
        cell: document.getElementById('cell').value,
        cell_leader: document.getElementById('cellLeader').value
    };
    
    try {
        await window.electronAPI.addMember(member);
        e.target.reset();
        await refreshAttendanceTable();
    } catch (error) {
        console.error('멤버 추가 중 오류:', error);
        alert('멤버 추가 중 오류가 발생했습니다.');
    }
});

// 전역 함수로 등록 (onclick 이벤트에서 사용)
window.toggleAttendance = toggleAttendance;

// 초기 테이블 로드
document.addEventListener('DOMContentLoaded', refreshAttendanceTable); 