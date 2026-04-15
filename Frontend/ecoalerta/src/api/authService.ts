import { apiClient } from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  register: async (credentials: RegisterCredentials): Promise<any> => {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
  }
};
