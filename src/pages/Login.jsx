import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Paper, Typography, Alert, Link, Box } from '@mui/material';
import FormBuilder from '../components/FormBuilder';
import { LOGIN_FIELDS } from '../constants';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (value) => {
    setLoading(true);
    setError('');
    try {
      await login(value.email, value.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            Login
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <FormBuilder fields={LOGIN_FIELDS} onSubmit={handleSubmit} submitText="Login" loading={loading} />

          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            New student?{' '}
            <Link href="/register" underline="hover">
              Sign up here
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
