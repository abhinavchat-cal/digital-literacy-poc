import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, LoginCredentials, RegisterData, API_URL } from '../services/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: { email: string; role: string; full_name: string } | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [user, setUser] = useState<{ email: string; role: string; full_name: string } | null>(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Set the Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      // Decode token to get user info
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({ 
          email: payload.sub, 
          role: payload.role, 
          full_name: payload.full_name 
        });
        
        // Navigate to role-specific dashboard
        switch (payload.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'trainer':
            navigate('/trainer');
            break;
          case 'candidate':
            navigate('/candidate');
            break;
          default:
            navigate('/login');
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        // If token is invalid, clear it
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await loginService(credentials);
      setToken(response.access_token);
      localStorage.setItem('token', response.access_token);
      
      // Set the Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
      
      // Decode token to get user info
      const payload = JSON.parse(atob(response.access_token.split('.')[1]));
      setUser({ 
        email: payload.sub, 
        role: payload.role, 
        full_name: payload.full_name 
      });
      
      // Navigate to role-specific dashboard
      switch (payload.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'trainer':
          navigate('/trainer');
          break;
        case 'candidate':
          navigate('/candidate');
          break;
        default:
          navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      setLoading(true);
      await axios.post(`${API_URL}/register`, data);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!token, 
      token, 
      user,
      loading,
      login, 
      register,
      logout, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 