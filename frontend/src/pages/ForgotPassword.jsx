import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Card from '../components/Card';
import Toast from '../components/Toast';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      await apiClient.post('/auth/forgot-password', data);
      setMessage('A password reset link has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Forgot Password</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      </Card>
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {message && <Toast message={message} type="success" onClose={() => setMessage(null)} />}
    </div>
  );
};

export default ForgotPassword;
