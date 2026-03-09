import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  LogOut, 
  BarChart3, 
  Users, 
  Vote, 
  Home,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-medium">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
              Get My Vote
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50 shadow-soft' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/results"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive('/results') 
                  ? 'text-primary-600 bg-primary-50 shadow-soft' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Results</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/candidates"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/candidates') 
                    ? 'text-primary-600 bg-primary-50 shadow-soft' 
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Vote</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/dashboard') 
                    ? 'text-primary-600 bg-primary-50 shadow-soft' 
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/admin') 
                    ? 'text-primary-600 bg-primary-50 shadow-soft' 
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin/candidates"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/candidates') 
                    ? 'text-primary-600 bg-primary-50 shadow-soft' 
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Candidates</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ring-2 ring-primary-200">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                    <p className="text-xs text-secondary-500">{user?.email}</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-md transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-all duration-200 shadow-medium"
                >
                  <Users className="w-4 h-4" />
                  <span>Register</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden border-t border-secondary-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/') 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>

          <Link
            to="/results"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/results') 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Results</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/candidates"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/candidates') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Vote</span>
            </Link>
          )}

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/dashboard') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/admin') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
