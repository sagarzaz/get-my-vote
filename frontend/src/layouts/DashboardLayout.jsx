import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { 
  Home, 
  Users, 
  Vote, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Clock,
  UserPlus,
  CheckSquare,
  FileText
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Get user avatar - use photo if available, otherwise use initial
  const getUserAvatar = (size = 'md') => {
    const sizeClass = size === 'lg' ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-lg';
    if (user?.photo) {
      const photoUrl = user.photo.startsWith('http') ? user.photo : `http://localhost:5000${user.photo}`;
      return (
        <img 
          src={photoUrl} 
          alt={user.name}
          className={`${sizeClass} rounded-full object-cover`}
        />
      );
    }
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold`}>
        {user?.name?.charAt(0).toUpperCase()}
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      path: '/vote',
      label: 'Vote',
      icon: Vote,
      color: 'text-primary-600'
    },
    {
      path: '/results',
      label: 'Results',
      icon: BarChart3,
      color: 'text-primary-600'
    }
  ];

  if (user?.role === 'admin') {
    menuItems.push(
      {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: Home,
        color: 'text-warning-600'
      },
      {
        path: '/admin/candidates',
        label: 'Candidates',
        icon: Users,
        color: 'text-warning-600'
      },
      {
        path: '/admin/voters',
        label: 'Voters',
        icon: UserPlus,
        color: 'text-warning-600'
      },
      {
        path: '/admin/votes',
        label: 'Votes',
        icon: FileText,
        color: 'text-warning-600'
      },
      {
        path: '/admin/settings',
        label: 'Settings',
        icon: Clock,
        color: 'text-warning-600'
      }
    );
  }

  return (
    <div className="h-screen bg-secondary-50 flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-large z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                      <Vote className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-secondary-900">Get My Vote</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {menuItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${isActive(item.path)
                          ? 'bg-primary-50 text-primary-600 shadow-soft'
                          : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* User Section - Always visible with gradient background */}
                <div className="p-4 border-t border-secondary-200">
                  <div className="bg-blue-600 rounded-lg p-4 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                      {getUserAvatar('lg')}
                      <div className="flex-1">
                        <p className="text-base font-bold">{user?.name}</p>
                        <p className="text-xs opacity-80 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 py-2.5 px-3 bg-white text-blue-600 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 h-full">
        <div className="w-72 bg-white shadow-medium flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center p-6 border-b border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Vote className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-secondary-900">Get My Vote</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-primary-50 text-primary-600 shadow-soft'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.path) ? '' : item.color}`} />
                <span className="font-medium">{item.label}</span>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-2 w-1 h-8 bg-primary-600 rounded-l"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* User Stats - Always visible with gradient background */}
          <div className="p-4 border-t border-secondary-200">
            <div className="bg-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center space-x-3 mb-3">
                {getUserAvatar('lg')}
                <div className="flex-1">
                  <p className="text-base font-bold">{user?.name}</p>
                  <p className="text-xs opacity-80 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 py-2.5 px-3 bg-white text-blue-600 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-secondary-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-secondary-900">Get My Vote</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
