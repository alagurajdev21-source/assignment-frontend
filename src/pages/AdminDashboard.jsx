import { useState, useContext, useMemo } from 'react';
import { Container, Typography, Paper, Alert, Button } from '@mui/material';
import FormBuilder from '../components/FormBuilder';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { TEACHER_REGISTRATION_FIELDS } from '../constants';

export default function AdminDashboard() {
  const { logout, token, user } = useContext(AuthContext);
  const [message, setMessage] = useState('');

  const handleSubmit = async (value) => {
    try {
      const res = await api.post('/admin/create-teacher', value, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(`Teacher account created: ${res.data.email}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create teacher');
    }
  };


  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={2}>Admin Dashboard</Typography>
      <Button color="error" variant="contained" onClick={logout} sx={{ mb: 3 }}>Logout</Button>

      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <Typography variant="h6" mb={2}>Create Teacher Account</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <FormBuilder
          fields={TEACHER_REGISTRATION_FIELDS}
          onSubmit={handleSubmit}
          submitText="Create Teacher"
          loading={false}
        />
      </Paper>
    </Container>
  );
}
