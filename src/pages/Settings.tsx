import { useThemeStore } from '../store/useThemeStore';
import { Switch } from '../components/ui/Switch';

export function Settings() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">설정</h1>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div>
            <h3 className="text-lg font-medium dark:text-white">다크 모드</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              화면의 밝기를 조절합니다
            </p>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            aria-label="다크 모드 토글"
          />
        </div>
      </div>
    </div>
  );
} 