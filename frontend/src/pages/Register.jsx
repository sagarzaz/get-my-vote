import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Card from '../components/Card';
import Webcam from 'react-webcam';

const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [formData, setFormData] = useState(null);
  const [capturedFace, setCapturedFace] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const webcamRef = useRef(null);
  const password = watch('password');

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  };

  const handleRetake = () => {
    setImgSrc(null);
  };

  const onSubmit = async (data) => {
    // Store form data and show face capture
    setFormData(data);
    setShowFaceCapture(true);
  };

  const handleFaceCapture = async (faceImage) => {
    if (!faceImage) {
      setError('Please capture your photo to continue');
      return;
    }
    
    setCapturedFace(faceImage);
    setShowFaceCapture(false);
    
    // Now submit registration with face image
    try {
      setIsLoading(true);
      setError(null);
      
      // Extract base64 data from the image (remove "data:image/jpeg;base64," prefix)
      const base64Image = faceImage.split(',')[1];
      
      const response = await apiClient.post('/auth/register', {
        ...formData,
        face_image: base64Image
      });
      
      // Store email and OTP for verification
      const otp = response.data.data.otp;
      const userId = response.data.data.user_id;
      localStorage.setItem('registrationEmail', formData.email);
      localStorage.setItem('registrationOTP', otp);
      localStorage.setItem('registrationUserId', userId);
      
      // Show success data on screen
      setSuccessData({
        message: 'Registration successful!',
        otp: otp,
        email: formData.email
      });
      
      // Navigate to OTP verification after a short delay
      setTimeout(() => {
        navigate('/otp-verification');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setShowFaceCapture(true); // Allow retry
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipFace = async () => {
    // Submit registration without face image
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post('/auth/register', formData);
      
      // Store email and OTP for verification
      const otp = response.data.data.otp;
      const userId = response.data.data.user_id;
      localStorage.setItem('registrationEmail', formData.email);
      localStorage.setItem('registrationOTP', otp);
      localStorage.setItem('registrationUserId', userId);
      
      // Show success data on screen
      setSuccessData({
        message: 'Registration successful!',
        otp: otp,
        email: formData.email
      });
      
      // Navigate to OTP verification after a short delay
      setTimeout(() => {
        navigate('/otp-verification');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setShowFaceCapture(true); // Allow retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        {successData ? (
          // Show success state after registration
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">Please verify your account using the OTP below.</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-600 mb-2">Your Verification OTP:</p>
              <p className="text-3xl font-mono font-bold text-blue-800 tracking-wider">{successData.otp}</p>
              <p className="text-xs text-blue-500 mt-2">Sent to: {successData.email}</p>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">Redirecting to verification page...</p>
            
            <Button 
              onClick={() => navigate('/otp-verification')} 
              className="w-full"
            >
              Go to OTP Verification
            </Button>
          </div>
        ) : (
          // Show registration form
          <>
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
                  placeholder="+919999999999"
                  {...register('phone', { required: 'Phone number is required' })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.dateOfBirth && <p className="text-error text-sm mt-1">{errors.dateOfBirth.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
              </div>
              <div className="mb-6">
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
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Continue to Photo Capture'}
              </Button>
            </form>
            
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            </p>
          </>
        )}
      </Card>
      
      {showFaceCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Take Your Photo</h2>
            <p className="text-gray-600 mb-4 text-center">
              Please look at the camera and capture your photo. This will be used for face verification when voting.
            </p>
            
            <div className="mb-4">
              {imgSrc ? (
                <img src={imgSrc} alt="captured" className="w-full rounded-lg mx-auto" />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                />
              )}
            </div>
            
            <div className="flex gap-3 mb-4">
              {imgSrc ? (
                <>
                  <Button onClick={handleRetake} className="flex-1 bg-gray-500">Retake</Button>
                  <Button onClick={() => handleFaceCapture(imgSrc)} className="flex-1">Confirm Photo</Button>
                </>
              ) : (
                <Button onClick={capture} className="w-full">Capture Photo</Button>
              )}
            </div>
            
            <Button 
              onClick={handleSkipFace} 
              className="w-full bg-yellow-500 hover:bg-yellow-600"
              disabled={isLoading}
            >
              Skip Photo (Optional)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
