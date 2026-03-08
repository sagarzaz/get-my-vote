import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, AlertCircle, CheckCircle, User, RefreshCw, ShieldCheck } from 'lucide-react';

const FaceCapture = ({ onCapture, onClose, disabled = false }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(true);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError('');
  };

  const handleCapture = async () => {
    if (!capturedImage) return;

    setLoading(true);
    setError('');

    try {
      await onCapture(capturedImage);
    } catch (err) {
      setError('Failed to process face image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Face Verification</h2>
                <p className="text-blue-100 text-sm">Verify your identity to cast vote</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={disabled}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Camera Error State */}
          {cameraError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Camera Not Available
              </h3>
              <p className="text-gray-600 mb-6">
                Please allow camera access or check your device settings.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCamera}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 mx-auto shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </motion.button>
            </motion.div>
          ) : !capturedImage ? (
            /* Camera View */
            <div className="relative">
              {/* Video Container with Overlay */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Face Guide Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-56 h-56 border-4 border-white/30 rounded-full flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                </div>

                {/* Scanning Line Animation */}
                <motion.div
                  animate={{ y: [0, 200, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"
                />
              </div>

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-center"
              >
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Position Your Face</span>
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure good lighting on your face</li>
                  <li>• Remove glasses or accessories</li>
                  <li>• Keep face centered in the frame</li>
                  <li>• Look directly at the camera</li>
                </ul>
              </motion.div>

              {/* Capture Button */}
              <div className="flex justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={captureImage}
                  disabled={disabled}
                  className="w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full group-hover:scale-90 transition-transform">
                  </div>
                </motion.button>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              {/* Captured Image Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-xl overflow-hidden aspect-[4/3]"
              >
                <img
                  src={capturedImage}
                  alt="Captured face"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-500 text-white p-2 rounded-full shadow-lg"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={retakePhoto}
                  disabled={disabled || loading}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Retake</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCapture}
                  disabled={disabled || loading}
                  className="flex-1 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirm & Vote</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </motion.div>
  );
};

export default FaceCapture;
