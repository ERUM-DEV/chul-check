import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginScreen } from '../pages/LoginScreen';
import { useNavigate } from '@tanstack/react-router';

// Mock the router
const mockNavigate = jest.fn();
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn()
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock the login function
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    window.electronAPI.login = jest.fn();
  });

  it('renders login form', () => {
    render(<LoginScreen />);
    expect(screen.getByLabelText(/pin/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('shows error message when submitting empty PIN', async () => {
    render(<LoginScreen />);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/pin을 입력해주세요/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    (window.electronAPI.login as jest.Mock).mockResolvedValueOnce(true);
    render(<LoginScreen />);

    const pinInput = screen.getByLabelText(/pin/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(pinInput, { target: { value: '1234' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.electronAPI.login).toHaveBeenCalledWith('1234');
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/attendance' });
    });
  });

  it('shows error message on failed login', async () => {
    (window.electronAPI.login as jest.Mock).mockResolvedValueOnce(false);
    render(<LoginScreen />);

    const pinInput = screen.getByLabelText(/pin/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(pinInput, { target: { value: '1234' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/잘못된 pin입니다/i)).toBeInTheDocument();
    });
  });

  it('limits PIN input to 4 digits', () => {
    render(<LoginScreen />);
    const pinInput = screen.getByLabelText(/pin/i);

    fireEvent.change(pinInput, { target: { value: '12345' } });
    expect(pinInput).toHaveValue('1234');
  });

  it('shows loading state during login process', async () => {
    (window.electronAPI.login as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    render(<LoginScreen />);

    const pinInput = screen.getByLabelText(/pin/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(pinInput, { target: { value: '1234' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
}); 