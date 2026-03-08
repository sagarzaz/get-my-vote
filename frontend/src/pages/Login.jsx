import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthContext from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const user = await login(data.email, data.password);
      // Redirect based on user role
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Welcome Back</h2>
        
        {error && (
          <div 
            className="mb-6 p-4 rounded-lg border transition-all duration-200 animate-fade-in"
            role="alert"
            aria-live="assertive"
            style={{ 
              backgroundColor: '#fef2f2',
              borderColor: '#fecaca',
              color: '#991b1b'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm leading-snug">
                  Authentication Failed
                </p>
                <p className="text-sm mt-1 opacity-90">
                  {error}
                </p>
                <p className="text-xs mt-2 opacity-75">
                  Please verify your credentials and try again.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
        </div>
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
