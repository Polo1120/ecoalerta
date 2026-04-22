import { useMutation } from '@tanstack/react-query';
import { authService, type LoginCredentials, type RegisterCredentials } from '../api/authService';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const loginAction = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data, variables) => {
      loginAction(data.access_token, {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || 'user'
      });
      navigate('/');
    },
  });

  const signupMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: () => {
      navigate('/login', { state: { registered: true } });
    },
  });

  return {
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    signup: signupMutation.mutate,
    isSignupLoading: signupMutation.isPending,
    signupError: signupMutation.error,
  };
}
