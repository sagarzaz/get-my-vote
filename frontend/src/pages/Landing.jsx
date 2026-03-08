import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { BarChart3 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold mb-4"
      >
        Welcome to Get My Vote
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl text-neutral/80 mb-8"
      >
        A secure and transparent online voting platform.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link to="/register">
          <Button className="w-full sm:w-auto">Get Started</Button>
        </Link>
        <Link to="/login">
          <Button className="w-full sm:w-auto">Login</Button>
        </Link>
        <Link to="/results">
          <Button className="w-full sm:w-auto bg-success hover:bg-success/90 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            View Results
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Landing;
