아래 내용을 **바로 코드로 옮길 수 있도록** 명확하게 세부 절차로 정리했어.  
인공지능 IDE Cursor가 바로 이해할 수 있도록 구체적인 절차와 예시 코드까지 포함해서 알려줄게.

---

# ✅ **STEP 1: SQLite DB 환경 구축 및 데이터 모델링** (상세 개발 가이드)

아래 모든 과정은 인공지능 IDE Cursor에서 바로 실행 가능한 단위로 작성했으니, 단계별로 진행하면 돼.

---

## 📌 **[1] 프로젝트 폴더에 SQLite 설치 및 설정**

### **① 의존성 설치 (Electron 프로젝트 폴더에서 실행)**

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

---

## 📌 **② SQLite DB 초기화 및 테이블 생성 스크립트 작성**

- 프로젝트 루트에 아래 경로로 파일을 생성:

```bash
touch src/db/init-db.js
```

- 생성된 파일에 아래 내용을 작성하여 초기화:

**`src/db/db-init.js`**

```js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// DB 파일 생성 경로
const db = new Database('attendance.db');

const initDB = () => {
  // members 테이블 생성
  db.prepare(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      group_name TEXT NOT NULL,
      name TEXT NOT NULL,
      birth_date TEXT,
      gender TEXT NOT NULL,
      joined_date TEXT NOT NULL,
      generation TEXT NOT NULL,
      roles TEXT NOT NULL,
      recent_attendance_date TEXT,
      attendance_count INTEGER DEFAULT 0,
      enable INTEGER DEFAULT 1,
      long_absence INTEGER DEFAULT 0,
      long_absence_reason TEXT DEFAULT NULL
    );
  `).run();

  // members_history 테이블 생성
  db.prepare(`
    CREATE TABLE IF NOT EXISTS members_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      group_name TEXT NOT NULL,
      changed_field TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  // attendances 테이블 생성
  db.prepare(`
    CREATE TABLE IF NOT EXISTS attendances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_date TEXT NOT NULL,
      member_id TEXT NOT NULL,
      attendance_type TEXT NOT NULL,
      absence_reason TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  console.log('DB 초기화 완료');
};

initDB();
```

### **✅ 초기화 실행 방법** (터미널에서 직접 실행해 확인)

```bash
node src/db/init-db.js
```

실행 후 프로젝트 폴더에 `attendance.db` 파일이 생성됨.

---

## 📌 **③ 초기 테스트 데이터 입력하기**

- 빠른 개발 진행을 위해 초기 데이터를 미리 준비 (`src/db/init-data.ts` 파일 생성):

```typescript
// initData.ts
import Database from 'better-sqlite3';

const db = new Database('attendance.db');

const insertMember = db.prepare(`
  INSERT INTO members (
    id, group_name, name, birth_date, gender, joined_date, generation, roles, recent_attendance_date, attendance_count, enable, long_absence, long_absence_reason
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const members = [
  ['김민수_950101_M_202401', '셀A', '김민수', '950101', 'M', '202401', 'POWER', '찬양팀,임원', '20240310', 5, 1, 0, null],
  ['이영희_000000_F_202402', '새가족', '이영희', null, 'F', '202402', 'NEW', '새가족', null, 0, 1, 0, null],
  ['박준수_980304_M_202301', '셀B', '박준수', '980101', 'M', '202402', 'POWER', '성도', null, 0, 1, 1, '군대']
]);

const insertAllMembers = db.transaction((members) => {
  for (const m of members) insertMember.run(m);
});

insertAllMembers(members);
console.log('초기 데이터 입력 완료');
```

- 실행:
```bash
npx ts-node initData.ts
```

---

## 📌 **③ Electron (메인 프로세스) DB 연결 및 IPC API 구성**

### **Electron에서 DB 접근 설정**

- 메인 프로세스에서 아래처럼 정의하여 React에서 접근 가능하게 설정:

```js
// electron-main.js
import { app, ipcMain } from 'electron';
import Database from 'better-sqlite3';
import path from 'path';

// 앱 실행 경로 기준 DB 설정
const dbPath = path.join(app.getPath('userData'), 'attendance.db');
const db = new Database(dbPath);

// 전체 성도 목록 조회
ipcMain.handle('get-members', () => {
  return db.prepare('SELECT * FROM members WHERE enable=1 ORDER BY group_name, name').all();
});

// 성도 추가
ipcMain.handle('add-member', (_, member) => {
  db.prepare(`
    INSERT INTO members (id, group_name, name, gender, joined_date, generation, roles)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(member.id, member.group_name, member.name, member.gender, member.joined_date, member.generation, member.roles);
});

// 성도 soft-delete 처리
ipcMain.handle('delete-member', (_, id) => {
  db.prepare('UPDATE members SET enable=0 WHERE id=?').run(id);
});

```

---

## 📌 **③ Electron-React IPC 연동 (렌더러 프로세스 예시)**

React 컴포넌트에서 데이터를 조회하는 방식 예시:

```tsx
// renderer React 컴포넌트
import { useEffect, useState } from 'react';

function MemberList() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      const membersData = await window.electron.invoke('get-members');
      setMembers(membersData);
    };
    loadMembers();
  }, []);

  return (
    <div>
      {members.map((member) => (
        <div key={member.id}>
          {member.group_name} - {member.name}
        </div>
      ))}
  );
}

export default MemberList;
```

---

## 📌 **③ 테이블 구조 및 쿼리 문서화**

아래 항목을 Notion 또는 별도 문서로 명확히 정리:

- 테이블 스키마 및 컬럼 설명
- 사용 예시 CRUD 쿼리
- ERD(Entity-Relationship Diagram) 간략화하여 포함
- 변경 시 즉시 업데이트 유지

---

## 🚩 **④ 최종 확인 및 테스트**

- 생성된 테이블 구조와 데이터를 SQLite GUI 클라이언트(**DBeaver, DB Browser for SQLite 등**)를 통해 직접 확인
- 작성된 코드가 정상 작동하는지 Cursor IDE에서 단계별로 실행해 확인

---