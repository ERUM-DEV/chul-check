-- 성도 테이블
CREATE TABLE members (
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
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_type TEXT NOT NULL, -- '예배만', '전체', '셀모임만'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    UNIQUE(member_id, attendance_date)
);

-- 성도 정보 수정 이력 테이블
CREATE TABLE members_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    changed_field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 행사 테이블
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    event_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 관리자 설정 테이블
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pin TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 