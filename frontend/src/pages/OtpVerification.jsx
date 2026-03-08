import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Card from '../components/Card';
import Toast from '../components/Toast';

const OtpVerification = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const onSubmit = async (data) => {
    try {
      await apiClient.post('/auth/verify-otp', data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleResend = async () => {
    try {
      // Assuming the user's email is stored in localStorage or context after registration
      const email = localStorage.getItem('registrationEmail'); 
      await apiClient.post('/auth/resend-otp', { email });
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">OTP Verification</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="otp">Enter 6-digit OTP</label>
            <input
              id="otp"
              type="text"
              maxLength="6"
              {...register('otp', { 
                required: 'OTP is required',
                minLength: { value: 6, message: 'OTP must be 6 digits' },
                maxLength: { value: 6, message: 'OTP must be 6 digits' }
              })}
              className="w-full px-3 py-2 border rounded-md text-center tracking-[1em]"
            />
            {errors.otp && <p className="text-error text-sm mt-1">{errors.otp.message}</p>}
          </div>
          <Button type="submit" className="w-full">Verify</Button>
        </form>
        <div className="text-center mt-4">
          <button onClick={handleResend} className="text-sm text-primary hover:underline">Resend OTP</button>
        </div>
      </Card>
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {message && <Toast message={message} type="success" onClose={() => setMessage(null)} />}
    </div>
  );
};

export default OtpVerification;
