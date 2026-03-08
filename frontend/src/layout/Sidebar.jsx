import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Vote, BarChart2, Users, Shield } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: <Home />, name: 'Dashboard' },
    { path: '/vote', icon: <Vote />, name: 'Vote' },
    { path: '/results', icon: <BarChart2 />, name: 'Results' },
    { path: '/candidates', icon: <Users />, name: 'Candidates' },
  ];

  if (user && user.role === 'admin') {
    menuItems.push({ path: '/admin/dashboard', icon: <Shield />, name: 'Admin' });
  }

  return (
    <aside className="w-64 bg-neutral text-white h-screen p-4">
      <div className="flex items-center mb-8">
        <Link to="/" className="text-2xl font-bold text-white">
          Get My Vote
        </Link>
      </div>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-2 my-2 rounded-md hover:bg-primary ${
                  location.pathname === item.path ? 'bg-primary' : ''
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
