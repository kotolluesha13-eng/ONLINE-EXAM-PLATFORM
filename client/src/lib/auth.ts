import { apiRequest } from "./queryClient";
import type { User, InsertUser, LoginCredentials } from "@shared/schema";

const TOKEN_KEY = 'exam_auth_token';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  async register(userData: InsertUser): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiRequest('GET', '/api/auth/me');
    return await response.json();
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

// Override the default fetch to include auth token
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
  const token = authApi.getToken();
  if (token) {
    init = init || {};
    init.headers = {
      ...init.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  return originalFetch(input, init);
};
