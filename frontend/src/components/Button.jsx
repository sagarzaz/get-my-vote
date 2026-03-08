import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
