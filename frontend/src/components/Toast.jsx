import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose();
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  const toastVariants = {
    hidden: { y: -50, opacity: 0, scale: 0.9 },
    visible: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -50, opacity: 0, scale: 0.9 },
  };

  const toastStyles = {
    info: 'bg-blue-600 border-blue-700',
    success: 'bg-green-600 border-green-700',
    warning: 'bg-amber-500 border-amber-600',
    error: 'bg-red-600 border-red-700',
  };

  const iconStyles = {
    info: 'text-blue-200',
    success: 'text-green-200',
    warning: 'text-amber-200',
    error: 'text-red-200',
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const Icon = icons[type] || Info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4`}
        >
          <div className={`flex items-center gap-3 p-4 rounded-lg text-white shadow-xl border-b-4 ${toastStyles[type]}`}>
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconStyles[type]}`} />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
              onClick={() => {
                setIsVisible(false);
                if (onClose) onClose();
              }}
              className="p-1 rounded-md hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
