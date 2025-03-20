import { Link, Outlet } from '@tanstack/react-router';
import { useThemeStore } from '../store/useThemeStore';
import { useEffect } from 'react';

export function Layout() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 dark:text-white">
      <main className="flex-1">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex justify-around py-3">
            <Link
              to="/"
              activeProps={{ className: 'text-blue-600 dark:text-blue-400' }}
              className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              <span className="text-xs">대시보드</span>
            </Link>
            <Link
              to="/attendance"
              activeProps={{ className: 'text-blue-600 dark:text-blue-400' }}
              className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              <span className="text-xs">출석체크</span>
            </Link>
            <Link
              to="/members"
              activeProps={{ className: 'text-blue-600 dark:text-blue-400' }}
              className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              <span className="text-xs">성도관리</span>
            </Link>
            <Link
              to="/settings"
              activeProps={{ className: 'text-blue-600 dark:text-blue-400' }}
              className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              <span className="text-xs">설정</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="h-16"></div>
    </div>
  );
} 