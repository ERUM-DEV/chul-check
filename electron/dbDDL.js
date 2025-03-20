const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

// 데이터베이스 연결 설정
const db = new Database('church.db', { verbose: console.log })

// 스키마 파일 읽기 및 실행
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
db.exec(schema)

// 기본 PIN 설정 (초기값: 0000)
db.exec(`
  INSERT OR IGNORE INTO settings (id, pin) VALUES (1, '0000');
`)

// 테스트 데이터 생성
db.exec(`
  -- 테스트용 성도 데이터
  INSERT OR IGNORE INTO members (
    id, group_name, name, birth_date, gender, joined_date, 
    generation, roles, recent_attendance_date, attendance_count, enable
  ) VALUES 
    ('홍길동_990101_M_202301', '1셀', '홍길동', '1999-01-01', 'M', '202301', 
     'POWER Generation', '성도,찬양팀', NULL, 0, 1),
    ('김철수_000101_M_202302', '2셀', '김철수', '2000-01-01', 'M', '202302',
     'POWER Generation', '성도', NULL, 0, 1),
    ('이영희_980101_F_202303', '새가족셀', '이영희', '1998-01-01', 'F', '202303',
     'POWER Generation', '성도,새가족', NULL, 0, 1);
`)

// IPC 핸들러 설정
// 1. 인증 관련
ipcMain.handle('auth:checkPin', async (event, pin) => {
  const stmt = db.prepare('SELECT pin FROM settings WHERE id = 1')
  const result = stmt.get()
  return result.pin === pin
})

// 2. 성도 관리 관련
ipcMain.handle('getAllMembers', () => {
  const stmt = db.prepare(`
    SELECT m.*, 
           GROUP_CONCAT(DISTINCT a.attendance_date) as attendance_dates,
           COUNT(DISTINCT a.attendance_date) as total_attendance
    FROM members m
    LEFT JOIN attendance a ON m.id = a.member_id
    WHERE m.enable = 1
    GROUP BY m.id
    ORDER BY m.group_name, m.name
  `)
  return stmt.all()
})

// 성도 추가
ipcMain.handle('addMember', (event, member) => {
  console.log('Adding new member:', member);
  
  // ID 생성: 이름_생년월일_성별_가입연월
  const id = `${member.name}_${member.birthDate?.replace(/-/g, '') || '000000'}_${member.gender}_${member.joinedDate.replace(/-/g, '')}`
  console.log('Generated ID:', id);
  
  try {
    // 성도 추가
    const stmt = db.prepare(`
      INSERT INTO members (
        id, group_name, name, birth_date, gender, joined_date,
        generation, roles, recent_attendance_date, attendance_count,
        enable, long_absence, long_absence_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      id,
      member.groupName,
      member.name,
      member.birthDate || null,
      member.gender,
      member.joinedDate,
      member.generation,
      member.roles.join(','),
      null,
      0,
      1,
      member.longAbsence ? 1 : 0,
      member.longAbsenceReason || null
    )
    
    console.log('Member added successfully:', result);
    return result;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
})

ipcMain.handle('updateMember', (event, { id, field, value, oldValue }) => {
  // 성도 정보 업데이트
  const updateStmt = db.prepare(`UPDATE members SET ${field} = ? WHERE id = ?`)
  const result = updateStmt.run(value, id)
  
  // 변경 이력 기록
  const historyStmt = db.prepare(`
    INSERT INTO members_history (member_id, changed_field, old_value, new_value)
    VALUES (?, ?, ?, ?)
  `)
  historyStmt.run(id, field, oldValue, value)
  
  return result
})

// 3. 출석 관리 관련
ipcMain.handle('attendance:remove', (event, { memberId, date }) => {
  const stmt = db.prepare(`
    DELETE FROM attendance 
    WHERE member_id = ? AND attendance_date = ?
  `)
  return stmt.run(memberId, date)
})

ipcMain.handle('attendance:getToday', (event, date) => {
  const stmt = db.prepare(`
    SELECT member_id, attendance_type 
    FROM attendance 
    WHERE attendance_date = ?
  `)
  return stmt.all(date)
})

ipcMain.handle('attendance:mark', (event, { memberId, date, type = '예배만' }) => {
  // 장결자 체크
  const memberStmt = db.prepare('SELECT long_absence FROM members WHERE id = ?')
  const member = memberStmt.get(memberId)
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO attendance (member_id, attendance_date, attendance_type)
    VALUES (?, ?, ?)
  `)
  const result = stmt.run(memberId, date, type)
  
  // 장결자였다면 상태 해제
  if (member && member.long_absence === 1) {
    const updateStmt = db.prepare(`
      UPDATE members 
      SET long_absence = 0, 
          long_absence_reason = NULL 
      WHERE id = ?
    `)
    updateStmt.run(memberId)
    
    // 이력 기록
    const historyStmt = db.prepare(`
      INSERT INTO members_history (member_id, changed_field, old_value, new_value)
      VALUES (?, ?, ?, ?)
    `)
    historyStmt.run(memberId, 'long_absence', '1', '0')
  }
  
  return { result, wasLongAbsent: member?.long_absence === 1 }
})

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 개발 모드에서는 localhost:3001을 로드하고, 프로덕션 모드에서는 dist/index.html을 로드합니다
  if (process.argv.includes('--dev')) {
    // Vite 개발 서버가 시작될 때까지 잠시 대기
    setTimeout(() => {
      win.loadURL('http://localhost:3000')
      win.webContents.openDevTools()
    }, 1000)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 