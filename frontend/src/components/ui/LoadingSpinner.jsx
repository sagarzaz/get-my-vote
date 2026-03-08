import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', color = 'primary', fullScreen = false }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colors = {
    primary: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
  };

  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-2 ${colors[color]} rounded-full`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
};

// Skeleton Loader Component
export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded',
  };

  return (
    <div className={`animate-pulse bg-gray-200 ${variants[variant]} ${className}`} />
  );
};

// Card Skeleton
export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
    <div className="flex items-center mb-4">
      <Skeleton className="w-16 h-16 rounded-2xl" variant="rect" />
      <div className="ml-4 flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" variant="rect" />
        <Skeleton className="h-4 w-1/2" variant="rect" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-4" variant="rect" />
    <Skeleton className="h-2 w-full mb-2" variant="rect" />
    <Skeleton className="h-10 w-full" variant="rect" />
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className="h-4 w-full" variant="rect" />
      </td>
    ))}
  </tr>
);

// Text Skeleton
export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        variant="rect" 
      />
    ))}
  </div>
);

export default LoadingSpinner;
