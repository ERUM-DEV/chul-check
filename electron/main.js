const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Database = require('better-sqlite3')

// 데이터베이스 연결 설정
const db = new Database('church.db', { verbose: console.log })

// 테이블 생성
db.exec(`
  -- 성도 테이블
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY, -- 이름_생년월일_성별_가입연월
    group_name TEXT NOT NULL,
    name TEXT NOT NULL,
    birth_date TEXT,
    gender TEXT NOT NULL,
    joined_date TEXT NOT NULL,
    generation TEXT NOT NULL,
    roles TEXT NOT NULL, -- 직분(","로 다중선택)
    recent_attendance_date TEXT,
    attendance_count INTEGER DEFAULT 0,
    enable INTEGER DEFAULT 1,
    long_absence INTEGER DEFAULT 0, -- 0(정상), 1(장결)
    long_absence_reason TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 출석 기록 테이블
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_type TEXT NOT NULL, -- '예배만', '전체', '셀모임만'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    UNIQUE(member_id, attendance_date)
  );

  -- 성도 정보 수정 이력 테이블
  CREATE TABLE IF NOT EXISTS members_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    changed_field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
  );

  -- 행사 테이블
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    event_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 관리자 설정 테이블
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pin TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// 기본 PIN 설정 (초기값: 0000)
db.exec(`
  INSERT OR IGNORE INTO settings (id, pin) VALUES (1, '0000');
`)

// 테스트 데이터 생성
db.exec(`
  -- 테스트용 성도 데이터
  INSERT OR IGNORE INTO members (
    id, group_name, name, birth_date, gender, joined_date, 
    generation, roles, recent_attendance_date, attendance_count
  ) VALUES 
    ('홍길동_990101_M_202301', '1셀', '홍길동', '1999-01-01', 'M', '202301', 
     'POWER Generation', '성도,찬양팀', NULL, 0),
    ('김철수_000101_M_202302', '2셀', '김철수', '2000-01-01', 'M', '202302',
     'POWER Generation', '성도', NULL, 0),
    ('이영희_980101_F_202303', '새가족셀', '이영희', '1998-01-01', 'F', '202303',
     'POWER Generation', '성도,새가족', NULL, 0);
`)

// IPC 핸들러 설정
// 1. 인증 관련
ipcMain.handle('auth:checkPin', async (event, pin) => {
  const stmt = db.prepare('SELECT pin FROM settings WHERE id = 1')
  const result = stmt.get()
  return result.pin === pin
})

// 2. 성도 관리 관련
ipcMain.handle('members:getAll', () => {
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

ipcMain.handle('members:add', (event, member) => {
  const stmt = db.prepare(`
    INSERT INTO members (
      id, group_name, name, birth_date, gender, joined_date, 
      generation, roles
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    member.id,
    member.group_name,
    member.name,
    member.birth_date,
    member.gender,
    member.joined_date,
    member.generation,
    member.roles.join(',')
  )
})

ipcMain.handle('members:update', (event, { id, field, value, oldValue }) => {
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

  win.loadFile('index.html')
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