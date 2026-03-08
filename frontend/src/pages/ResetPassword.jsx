import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Card from '../components/Card';
import Toast from '../components/Toast';

const ResetPassword = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const password = watch('password');
  const token = searchParams.get('token');

  const onSubmit = async (data) => {
    try {
      await apiClient.post('/auth/reset-password', { ...data, token });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.confirmPassword && <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full">Reset Password</Button>
        </form>
      </Card>
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </div>
  );
};

export default ResetPassword;
