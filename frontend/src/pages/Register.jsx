import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Card from '../components/Card';
import Toast from '../components/Toast';

const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await apiClient.post('/auth/register', data);
      navigate('/otp-verification');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
          </div>
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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="+1234567890 (include country code)"
              {...register('phone', { required: 'Phone is required' })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm Password</label>
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
          <Button type="submit" className="w-full">Register</Button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </div>
      </Card>
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </div>
  );
};

export default Register;
