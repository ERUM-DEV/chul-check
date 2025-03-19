import {
  RootRoute,
  Route,
  Router,
  Navigate,
  Outlet,
  Link,
  redirect,
} from '@tanstack/react-router';
import { useAuthStore } from './store/useAuthStore';
import { LoginScreen } from './pages/LoginScreen';
import { AttendanceCheck } from './pages/AttendanceCheck';
import { MemberList } from './pages/MemberList';
import { Dashboard } from './pages/Dashboard';

// Link 컴포넌트의 props 타입 정의
interface LinkClassNameProps {
  isActive: boolean;
}

// 보호된 레이아웃 컴포넌트
function ProtectedLayout() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const logout = useAuthStore(state => state.logout);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const getLinkClassName = ({ isActive }: LinkClassNameProps) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive
      ? 'bg-gray-900 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <div>
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white font-bold">교회 출석부</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/"
                    className={getLinkClassName}
                  >
                    대시보드
                  </Link>
                  <Link
                    to="/attendance"
                    className={getLinkClassName}
                  >
                    출석체크
                  </Link>
                  <Link
                    to="/members"
                    className={getLinkClassName}
                  >
                    성도관리
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={logout}
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

// 루트 라우트
const rootRoute = new RootRoute({
  component: Outlet,
});

// 로그인 라우트
const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginScreen,
});

// 보호된 라우트
const protectedRoute = new Route({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedLayout,
  beforeLoad: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
      });
    }
  },
});

// 메인 라우트
const indexRoute = new Route({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: Dashboard,
});

// 성도 목록 라우트
const membersRoute = new Route({
  getParentRoute: () => protectedRoute,
  path: '/members',
  component: MemberList,
});

// 출석 체크 라우트
const attendanceRoute = new Route({
  getParentRoute: () => protectedRoute,
  path: '/attendance',
  component: AttendanceCheck,
});

// 라우터 설정
const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    indexRoute,
    membersRoute,
    attendanceRoute,
  ]),
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
} 