import { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Alert, Link, Box } from '@mui/material';
import FormBuilder from '../components/FormBuilder';
import { REGISTRATION_FIELDS } from '../constants';

export default function Register() {

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (value) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', value);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <FormBuilder fields={REGISTRATION_FIELDS} onSubmit={handleSubmit} submitText="Register" loading={loading} />

          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" underline="hover">
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
