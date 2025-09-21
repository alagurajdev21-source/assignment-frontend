import { createContext, useCallback, useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, role, name, _id } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ _id, role, name }));

    setToken(token);
    setUser({ _id, role, name });

    if (role === ROLES.TEACHER) navigate('/teacher-dashboard');
    else if (role === ROLES.STUDENT) navigate('/student-dashboard');
    else if (role === ROLES.ADMIN) navigate('/admin-dashboard');
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    navigate('/login');
  },[]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
