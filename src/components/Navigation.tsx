import { Link } from '@tanstack/react-router';

export function Navigation() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                이룸교회
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                출석부
              </Link>
              <Link
                to="/attendance"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                출석체크
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                대시보드
              </Link>
              <Link
                to="/members"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                멤버 관리
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 