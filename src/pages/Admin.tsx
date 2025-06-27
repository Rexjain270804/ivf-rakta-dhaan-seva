
import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if admin is already logged in (simple session management)
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('ivf_admin_logged_in');
    if (adminLoggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('ivf_admin_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ivf_admin_logged_in');
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div>
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleLogout}
          className="bg-ivf-red text-white px-4 py-2 rounded hover:bg-ivf-red/90 transition-colors"
        >
          Logout
        </button>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default Admin;
