import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';

export function SignupPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async ({ email, password }) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (!data.approved) {
        setError('Registration successful. Please wait for admin approval.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      type="signup"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
    />
  );
}
