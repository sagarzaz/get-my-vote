import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get first letter of user name for avatar fallback
  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Get user avatar - use photo if available, otherwise use initial
  const getUserAvatar = () => {
    if (user?.photo) {
      const photoUrl = user.photo.startsWith('http') ? user.photo : `http://localhost:5000${user.photo}`;
      return (
        <img 
          src={photoUrl} 
          alt={user.name}
          className="w-9 h-9 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
        {getInitial(user?.name)}
      </div>
    );
  };

  // Get large avatar for dropdown header
  const getLargeAvatar = () => {
    if (user?.photo) {
      const photoUrl = user.photo.startsWith('http') ? user.photo : `http://localhost:5000${user.photo}`;
      return (
        <img 
          src={photoUrl} 
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
        {getInitial(user?.name)}
      </div>
    );
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        {getUserAvatar()}
        <ChevronDown className={`w-4 h-4 text-secondary-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl border border-secondary-100 overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100/50">
              <div className="flex items-center space-x-3">
                {getLargeAvatar()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-secondary-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-secondary-500 truncate">
                    {user.email}
                  </p>
                  {user.role && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-150"
              >
                <LogOut className="w-4 h-4 text-secondary-500" />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
