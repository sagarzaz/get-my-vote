import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  padding = 'md',
  ...props 
}) => {
  const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const baseStyles = `bg-white rounded-xl shadow-md overflow-hidden ${paddingSizes[padding]}`;
  const hoverStyles = hover ? 'hover:shadow-xl transition-shadow duration-300 cursor-pointer' : '';
  
  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { y: -5 },
    whileTap: { scale: 0.98 },
  } : {};
  
  return (
    <Component 
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Header Component
Card.Header = ({ children, className = '' }) => (
  <div className={`border-b border-gray-100 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

// Card Title Component
Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

// Card Description Component
Card.Description = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 mt-1 ${className}`}>
    {children}
  </p>
);

// Card Content Component
Card.Content = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

// Card Footer Component
Card.Footer = ({ children, className = '' }) => (
  <div className={`border-t border-gray-100 pt-4 mt-4 ${className}`}>
    {children}
  </div>
);

export default Card;
