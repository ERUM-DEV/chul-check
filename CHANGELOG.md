# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.2](https://github.com/ERUM-DEV/chul-check/compare/v0.0.1...v0.0.2) (2025-03-21)

## [0.0.1] - 2025-03-21

### 프로젝트 초기 설정
- Vite + TypeScript + React 기반 프로젝트 구성
- Electron 데스크톱 애플리케이션 통합
- SQLite 데이터베이스(church.db) 연동

### 구현된 기능
- 교회 출석 관리 시스템 기본 구조 구축
- SQLite 데이터베이스 스키마 설계 및 구현
- 데이터베이스 DDL 스크립트 작성
- Electron과 React 간의 IPC 통신 구현

#### 데이터베이스 구조
- Members 테이블 구현
  - 14개 필드 구성 (id, group_name, name 등)
  - 필드별 타입 및 제약조건 정의
  - enable, long_absence 필드 기본값 설정
- Attendance History 테이블 구현
  - 기본 구조 설정 (id, member_id, date, type, created_at)
  - Members 테이블과 외래키 관계 설정

#### 목업 데이터 구현
- 셀 구조화 (10개 셀)
  - 전체 100명의 교인 데이터 생성
  - 셀별 인원 분포 (7-13명)
- 멤버 데이터 특성
  - 셀별 셀리더 지정
  - 1세대/2세대 균형 분포
  - 성별 분포 고려
  - 장기결석자 포함 (셀당 1-2명)
  - 기본 활성화 상태 설정

#### 데이터 관리 기능
- 기존 데이터 초기화 로직
- 테이블 존재 여부 확인
- 데이터 삽입 전 테이블 클리닝 프로세스

### 기술 스택 구성
- @tanstack/react-router를 이용한 라우팅 시스템 구축
- Tailwind CSS를 이용한 UI 스타일링 설정
- Jest 테스트 환경 구성
- TypeScript 설정 및 PostCSS 구성

### 개발 환경
- `npm run electron:dev`: 개발 모드 실행 (Vite + Electron)
- `npm run electron:build`: 프로덕션 빌드
- `npm test`: Jest 테스트 실행
- `npm run test:watch`: 테스트 감시 모드

### 의존성
- React 18.2.0
- Electron
- @tanstack/react-router
- @tanstack/react-table (테이블 데이터 관리)
- better-sqlite3 (SQLite 데이터베이스 연동)
- Bootstrap 5.3.3
- Zustand (상태 관리)
- Headless UI (접근성 있는 UI 컴포넌트)
- FontAwesome (아이콘)

### 프로젝트 구조
- `/src`: 메인 소스 코드
  - React 컴포넌트
  - 라우팅 설정
  - 상태 관리
- `/electron`: Electron 관련 코드
  - 메인 프로세스
  - IPC 통신
  - 데이터베이스 연동
- `church.db`: SQLite 데이터베이스
  - 교인 정보
  - 출석 기록
  - 교회 행사 데이터

[0.0.1]: https://github.com/username/project/releases/tag/v0.0.1 