import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ProfileMenu from '../components/ProfileMenu';
import { Menu, X, Vote, BarChart3, Users, Home, Shield, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
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
              <>
                <Link
                  to="/vote"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/vote') 
                      ? 'text-primary-600 bg-primary-50 shadow-soft' 
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                  }`}
                >
                  <Vote className="w-4 h-4" />
                  <span>Vote</span>
                </Link>

                <Link
                  to="/candidates"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/candidates') 
                      ? 'text-primary-600 bg-primary-50 shadow-soft' 
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Candidates</span>
                </Link>

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

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      location.pathname.startsWith('/admin') 
                        ? 'text-warning-600 bg-warning-50 shadow-soft' 
                        : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side - Profile or Login */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <ProfileMenu />
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-100">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-secondary-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <Link
                to="/results"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/results') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-secondary-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Results</span>
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/vote"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/vote') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-secondary-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Vote className="w-4 h-4" />
                    <span>Vote</span>
                  </Link>

                  <Link
                    to="/candidates"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/candidates') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-secondary-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Candidates</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-secondary-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname.startsWith('/admin') 
                          ? 'text-warning-600 bg-warning-50' 
                          : 'text-secondary-600'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  {/* Mobile Profile Section */}
                  <div className="pt-4 border-t border-secondary-100">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      {user?.photo ? (
                        <img 
                          src={user.photo.startsWith('http') ? user.photo : `http://localhost:5000${user.photo}`} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                        <p className="text-xs text-secondary-500">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 mt-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50 rounded-md"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="flex items-center justify-center px-3 py-2 mt-2 bg-primary-500 text-white rounded-md font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
