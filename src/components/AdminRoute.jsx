import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ROLES } from '../constants';

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== ROLES.ADMIN) return <Navigate to="/login" />;
  return children;
}
