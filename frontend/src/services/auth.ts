import axios from 'axios';

export const API_URL = 'http://localhost:8000/api/v1/auth';

export type UserRole = 'admin' | 'trainer' | 'candidate';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  aadhaar_id: string;
  role: UserRole;
  institute_id?: string; // Required for trainers and candidates
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user?: {
    email: string;
    role: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<TokenResponse> => {
  try {
    console.log('Auth service received credentials:', credentials);
    
    // Validate credentials before creating form data
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }

    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    formData.append('grant_type', '');
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    console.log('Form data being sent:', Object.fromEntries(formData.entries()));
    console.log('Request URL:', `${API_URL}/auth/login`);

    const response = await axios.post<TokenResponse>(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
    });

    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const authService = {
  async register(data: RegisterData): Promise<TokenResponse> {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  },

  getCurrentUser(): TokenResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  setAuthData(data: TokenResponse): void {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
}; 