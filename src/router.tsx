import {
  RootRoute,
  Route,
  Router,
} from '@tanstack/react-router';
import { AttendanceCheck } from './pages/AttendanceCheck';
import { MemberList } from './pages/MemberList';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Layout } from './components/Layout';

// Link 컴포넌트의 props 타입 정의
interface LinkClassNameProps {
  isActive: boolean;
}

// 루트 라우트
const rootRoute = new RootRoute({
  component: Layout,
});

// 메인 라우트
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

// 성도 목록 라우트
const membersRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/members',
  component: MemberList,
});

// 출석 체크 라우트
const attendanceRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/attendance',
  component: AttendanceCheck,
});

// 설정 라우트
const settingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

// 라우터 설정
const routeTree = rootRoute.addChildren([
  indexRoute,
  membersRoute,
  attendanceRoute,
  settingsRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
} 