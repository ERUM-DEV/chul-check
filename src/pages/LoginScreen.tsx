import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin) {
      setError('PIN을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(pin);
      if (success) {
        // 로그인 성공 시 출석체크 페이지로 이동
        navigate({ to: '/attendance' });
      } else {
        setError('잘못된 PIN입니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // PIN을 4자리로 제한
    if (value.length <= 4) {
      setPin(value);
      setError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            교회 출석부
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            PIN을 입력하여 로그인해주세요
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              type="password"
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              placeholder="PIN 번호 입력"
              pattern="[0-9]*"
              inputMode="numeric"
              autoFocus
              required
              className="text-center text-2xl tracking-widest"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              로그인
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 