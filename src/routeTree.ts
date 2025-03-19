import { createRootRoute, createRoute } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AttendanceCheck } from './pages/AttendanceCheck';
import { AttendanceSheet } from './pages/AttendanceSheet';
import { MemberList } from './pages/MemberList';

const rootRoute = createRootRoute({
  component: Layout,
});

const attendanceSheetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AttendanceSheet,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const attendanceCheckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/attendance',
  component: AttendanceCheck,
});

const memberListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/members',
  component: MemberList,
});

export const routeTree = rootRoute.addChildren([
  attendanceSheetRoute,
  dashboardRoute,
  attendanceCheckRoute,
  memberListRoute,
]); 