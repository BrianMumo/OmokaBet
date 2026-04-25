import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, walletAPI } from '../services/api';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('omokabet_token'));
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Load user on mount
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Socket.IO: join user room and listen for wallet updates
  useEffect(() => {
    if (user && user.id) {
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      }
      socketRef.current.emit('join', user.id);
      socketRef.current.on('wallet:updated', (data) => {
        if (data.balance !== undefined) {
          setUser(prev => prev ? { ...prev, balance: data.balance } : null);
        }
      });
    }

    return () => {
      if (socketRef.current && user?.id) {
        socketRef.current.emit('leave', user.id);
        socketRef.current.off('wallet:updated');
      }
    };
  }, [user?.id]);

  const loadUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to load user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const { data } = await authAPI.login({ identifier, password });
    localStorage.setItem('omokabet_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('omokabet_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('omokabet_token');
    localStorage.removeItem('omokabet_user');
    setToken(null);
    setUser(null);
  };

  const updateBalance = useCallback((newBalance) => {
    setUser(prev => prev ? { ...prev, balance: newBalance } : null);
  }, []);

  const refreshBalance = useCallback(async () => {
    try {
      const { data } = await walletAPI.getBalance();
      updateBalance(data.balance);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [updateBalance]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateBalance,
      refreshBalance,
      loadUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
