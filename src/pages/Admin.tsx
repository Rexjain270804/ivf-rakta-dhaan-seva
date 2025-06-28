
import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const { toast } = useToast();

  // Enhanced session validation
  const validateSession = () => {
    const adminLoggedIn = localStorage.getItem('ivf_admin_logged_in');
    const sessionData = localStorage.getItem('ivf_admin_session');
    
    if (adminLoggedIn === 'true' && sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        
        // Check if session has expired
        if (session.expiresAt && now > session.expiresAt) {
          handleLogout();
          toast({
            title: "सत्र समाप्त",
            description: "Your session has expired. Please login again.",
            variant: "destructive",
          });
          return false;
        }
        
        setSessionInfo(session);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Session validation error:', error);
        handleLogout();
        return false;
      }
    }
    
    return false;
  };

  // Check session on component mount and set up periodic validation
  useEffect(() => {
    validateSession();
    
    // Validate session every minute
    const sessionInterval = setInterval(() => {
      if (isAuthenticated) {
        validateSession();
      }
    }, 60000);
    
    // Warn user 10 minutes before session expires
    const warningInterval = setInterval(() => {
      if (sessionInfo && isAuthenticated) {
        const now = Date.now();
        const timeLeft = sessionInfo.expiresAt - now;
        const tenMinutes = 10 * 60 * 1000;
        
        if (timeLeft <= tenMinutes && timeLeft > 0) {
          toast({
            title: "सत्र चेतावनी",
            description: `Your session will expire in ${Math.ceil(timeLeft / 1000 / 60)} minutes.`,
          });
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => {
      clearInterval(sessionInterval);
      clearInterval(warningInterval);
    };
  }, [isAuthenticated, sessionInfo]);

  const handleLogin = () => {
    validateSession();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSessionInfo(null);
    localStorage.removeItem('ivf_admin_logged_in');
    localStorage.removeItem('ivf_admin_session');
    toast({
      title: "सफल लॉगआउट",
      description: "You have been logged out successfully.",
    });
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
        <div className="bg-white/90 px-3 py-2 rounded-lg shadow-md">
          <p className="text-xs text-gray-600">
            Logged in as: <span className="font-medium text-ivf-navy">{sessionInfo?.username}</span>
          </p>
          <p className="text-xs text-gray-500">
            Session expires: {sessionInfo?.expiresAt ? new Date(sessionInfo.expiresAt).toLocaleTimeString() : 'Unknown'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-ivf-red text-white px-4 py-2 rounded hover:bg-ivf-red/90 transition-colors shadow-md"
        >
          Secure Logout
        </button>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default Admin;
