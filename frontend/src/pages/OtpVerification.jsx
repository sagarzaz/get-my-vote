import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Card from '../components/Card';

const OtpVerification = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const navigate = useNavigate();
  const [storedOTP, setStoredOTP] = useState(null);
  const [email, setEmail] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Get stored OTP and email from registration
    const otp = localStorage.getItem('registrationOTP');
    const regEmail = localStorage.getItem('registrationEmail');
    setStoredOTP(otp);
    setEmail(regEmail);
    
    // Pre-fill the form if data exists
    if (regEmail) {
      setValue('email', regEmail);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      setIsVerifying(true);
      setError(null);
      
      const verifyEmail = data.email || email;
      
      if (!verifyEmail) {
        setError('Please enter your email address');
        return;
      }
      
      await apiClient.post('/auth/verify-otp', {
        email: verifyEmail,
        otp: data.otp
      });
      
      // Clear stored data after successful verification
      localStorage.removeItem('registrationOTP');
      localStorage.removeItem('registrationEmail');
      localStorage.removeItem('registrationUserId');
      
      setSuccess(true);
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      setError(null);
      
      const currentEmail = email || document.getElementById('email')?.value;
      
      if (!currentEmail) {
        setError('Please enter your email address first');
        return;
      }
      
      const response = await apiClient.post('/auth/resend-otp', { email: currentEmail });
      
      // Update stored OTP with new one
      if (response.data.data.otp) {
        localStorage.setItem('registrationOTP', response.data.data.otp);
        setStoredOTP(response.data.data.otp);
      }
      
      alert('New OTP sent! Check your email/SMS or the console.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Verified!</h2>
          <p className="text-gray-600 mb-4">Your account has been verified successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Verify Your Account</h2>
        
        {/* Display stored OTP for testing */}
        {storedOTP && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-600 mb-2 font-medium">Your Verification OTP:</p>
            <p className="text-3xl font-mono font-bold text-blue-800 text-center tracking-wider">{storedOTP}</p>
            <p className="text-xs text-blue-500 mt-2 text-center">
              (Email/SMS not received? Use this OTP)
            </p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="otp">Enter 6-digit OTP</label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              {...register('otp', { 
                required: 'OTP is required',
                minLength: { value: 6, message: 'OTP must be 6 digits' },
                maxLength: { value: 6, message: 'OTP must be 6 digits' }
              })}
              className="w-full px-3 py-2 border rounded-md text-center text-xl tracking-[0.5em]"
              placeholder="------"
            />
            {errors.otp && <p className="text-error text-sm mt-1">{errors.otp.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Didn't receive OTP?{' '}
            <button 
              onClick={handleResend} 
              className="text-primary hover:underline font-medium"
              type="button"
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default OtpVerification;
