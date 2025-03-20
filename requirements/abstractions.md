# 📋 『이룸교회 청년부 출석부』 애플리케이션 요구사항 명세서 (최종)

---

## 🛠️ 기술 스택

- **Electron**, **React**, **Shadcn/ui**, **Zustand**, **TanStack Router**, **TanStack Table**, **SQLite**

---

## 🏛️ 교회 기본 정보

- **교회 이름**: 이룸교회
- **위치**: 대한민국 경기도 용인시 수지
- **사용 대상**: 청년부 (추후 다른 부서로 확장 가능)

---

## 👥 사용자 권한 및 접근 방식

- **사용자**: 관리자 전용 (일반 사용자 없음)
- **인증 방식**: 없음

---

## 🎯 출석 체크 요구사항

### ✅ 출석 체크 방식
- 관리자가 기존 등록된 성도의 이름을 입력하여 출석 체크
- 이름 입력 시 정확한 일치만 허용 (부분 검색 불가)
- 출석 체크 상태 기본값: **예배만 출석**
  - 셀모임 출석 여부는 미정 상태로 유지(별도 수정 페이지에서 변경 가능)

### ✅ UI 및 인터랙션
- 성도 이름 입력 후 출석 성공 시 해당 셀의 배경을 초록색으로 변경
- 소속 그룹의 테두리를 **초록색으로 1초간 하이라이트**
- 총 출석 수는 화면 **상단**에서 실시간 업데이트
- 중복 출석 입력 시 즉시 경고 팝업 제공 (단, 동명이인은 자동 처리)

### ✅ 성도 추가 방식
- 출석체크 화면에서는 성도를 추가할 수 없음
- 성도 추가는 **하단 메뉴바의 별도 "성도 관리 페이지"**에서만 가능

---

## 📋 성도 정보 관리 페이지 요구사항

### ✅ 성도 기본 정보 테이블 구성
| 컬럼명             | 설명                            | 비고 |
|-------------------|---------------------------------|------|
| 그룹명             | 성도의 소속 그룹(셀 이름)        | 중복 불가 |
| 이름               | 성도의 이름                      | 필수 |
| 생년월일           | 생년월일 (YYMMDD)               | 없으면 빈값 허용 |
| 성별               | 성도의 성별(M/F)                 | |
| 가입연월           | 성도의 가입연월 (YYYYMM)         | |
| Generation         | 세대 구분 (POWER, NEW, WISE)    | 최초 자동 설정 후 수동 관리 |
| 직분               | 직분 (다중 선택 가능, `,`구분)  | 성도, 임원(섬김이), 찬양팀, 미디어팀, 목사님(사역자), 부장집사님, 새가족 |
| 최근 출석 날짜      | 최근 출석 날짜                   | 자동 업데이트 |
| 출석 횟수          | 총 출석 횟수                    | 자동 업데이트 |
| 장결 여부          | 장결 여부 (기본: X)              | |
| 장결 사유          | 군대, 해외, 유학, 기타, 미확인   | |
| 활성 여부(`enable`)| 1(활성), 0(삭제/비활성)          | Soft-delete |

### ✅ 성도 관리 화면 인터페이스 기능

- 성도 추가 버튼은 하단 메뉴바 → 성도 관리 페이지에서만 제공
- 기본 100명씩 표시, 무한 스크롤 방식으로 데이터 로딩
- 기본 정렬: **그룹명 → 이름** (가나다 순)
- 테이블의 각 셀 클릭 시 즉시 수정 가능(변경 사항 즉시 DB 반영)
- 그룹 변경은 드롭다운 메뉴에서 즉시 가능
- 삭제 버튼 클릭 → 삭제 확인 팝업 → Soft-delete(`enable=0`)처리
- 테이블의 너비가 화면보다 길 경우 **가로 스크롤 허용**
- 별도 하이라이트 강조 없음

---

## 📑 성도 수정 및 삭제 이력 관리 페이지 요구사항

- 성도 관리 페이지 내 **탭 전환**으로 접근 가능
- 모든 수정 및 삭제는 이력으로 기록(이력 내보내기 기능 없음)

### ✅ 이력 관리 테이블 구성
| 컬럼명 | 설명 |
|--------|------|
| 수정 일자 | 이력이 기록된 날짜 및 시간 |
| 성도 이름 | 수정된 성도 이름 |
| 그룹명 | 수정된 성도 그룹명 |
| 변경 필드명 | 변경된 필드(예: 장결여부, 그룹명 등) |
| 변경 전 값 | 변경 전 값 |
| 변경 후 값 | 변경 후 값 |

### ✅ 이력 조회 필터링 기능 제공
- 성도 이름, 그룹명 (부분 검색 가능)
- 직분, 변경 필드명 필터링 가능
- 기간(날짜) 필터링 가능
- 장결 상태 변경 내역만 필터링 제공

---

## 📅 보고서 및 통계 페이지 요구사항

### ✅ 통계 및 보고서 제공 방식
- 미리 정의된 기간(이번 주, 이번 달, 올해 등) 빠른 조회 버튼 제공
- 사용자가 직접 기간을 설정해 조회 가능
- 보고서에는 총 출석 인원, 올해 등록 인원, 올해 등록 인원 중 꾸준히 출석한 인원 비율을 표와 그래프로 표시
- 엑셀(`xlsx`) 파일 내보내기 지원
  - 파일명 형식: `부서명_YYYYMMDD_출석보고서.xlsx`
  - 모든 그룹을 하나의 Sheet에 표시

---

## 🚨 장기 결석자 관리 세부사항

### ✅ 장결 관리 프로세스
- 장기 결석자 출석 체크 시 알림 팝업 즉시 표시
- 출석 체크하면 장결 상태는 즉시 해제
- 장결 상태의 성도는 관리 페이지 테이블에서 기본적으로 표시 (숨김 옵션 별도 제공)

---

## 📌 데이터베이스 테이블 정의

### 성도 테이블(`members`)
```sql
CREATE TABLE members (
  id TEXT PRIMARY KEY, -- 이름_생년월일_성별_가입연월
  group_name TEXT NOT NULL,
  name TEXT NOT NULL,
  birth_date TEXT,
  gender TEXT NOT NULL, -- M/F
  joined_date TEXT NOT NULL,
  generation TEXT NOT NULL,
  roles TEXT NOT NULL,
  recent_attendance_date TEXT,
  attendance_count INTEGER DEFAULT 0,
  enable INTEGER DEFAULT 1,
  long_absence INTEGER DEFAULT 0,
  long_absence_reason TEXT DEFAULT NULL
);
```

### 성도 수정 이력 테이블(`members_history`)
```sql
CREATE TABLE members_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  changed_field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 출석 정보 테이블(`attendances`)
```sql
CREATE TABLE attendances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_date TEXT NOT NULL,
  member_id TEXT NOT NULL,
  attendance_type TEXT NOT NULL,
  absence_reason TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📌 Electron-React IPC 통신 기본 구조
### 메인 프로세스 (Electron)
```js
const { ipcMain } = require('electron');
const Database = require('better-sqlite3');
const db = new Database('attendance.db');

ipcMain.handle('get-members', () => {
  return db.prepare('SELECT * FROM members WHERE enable=1 ORDER BY group_name, name').all();
});
```

### 렌더러 프로세스 (React)
```js
const members = await window.electron.invoke('get-members');
```

---

## 🚩 개발 순서 요약
1. DB 구조 정의 및 데이터 준비
2. Electron + React 프로젝트 구성
3. Zustand 상태관리
4. TanStack Router 라우팅
5. shadcn/ui 컴포넌트 구축
6. SQLite 데이터 연동
7. TanStack Table 구성 및 데이터 연동
6. 최종 UI/UX 완성 및 테스트

---

## 🎯 위 내용은 『이룸교회 청년부 출석 관리 애플리케이션』 개발의 최종 확정된 요구사항 명세서입니다.