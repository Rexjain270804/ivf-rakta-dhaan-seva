
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  // Enhanced authentication with multiple credentials
  const ADMIN_CREDENTIALS = [
    { username: 'ivf_admin', password: 'JSPCODERS@2025!SECURE' },
    { username: 'blood_admin', password: 'IVF@BloodDonation2025' },
    { username: 'super_admin', password: 'SuperSecure@IVF2025!' }
  ];

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

  const checkLockout = () => {
    const lockoutData = localStorage.getItem('admin_lockout');
    if (lockoutData) {
      const { timestamp, attempts: lockedAttempts } = JSON.parse(lockoutData);
      const now = Date.now();
      
      if (lockedAttempts >= MAX_ATTEMPTS && (now - timestamp) < LOCKOUT_TIME) {
        const remainingTime = Math.ceil((LOCKOUT_TIME - (now - timestamp)) / 1000 / 60);
        return remainingTime;
      } else if ((now - timestamp) >= LOCKOUT_TIME) {
        localStorage.removeItem('admin_lockout');
        return 0;
      }
    }
    return 0;
  };

  const recordAttempt = (failed = false) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (failed && newAttempts >= MAX_ATTEMPTS) {
      const lockoutData = {
        timestamp: Date.now(),
        attempts: newAttempts
      };
      localStorage.setItem('admin_lockout', JSON.stringify(lockoutData));
      
      toast({
        title: "खाता लॉक हो गया",
        description: `Too many failed attempts. Account locked for ${LOCKOUT_TIME / 1000 / 60} minutes.`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const lockoutMinutes = checkLockout();
    if (lockoutMinutes > 0) {
      toast({
        title: "खाता लॉक है",
        description: `Account is locked. Try again in ${lockoutMinutes} minutes.`,
        variant: "destructive",
      });
      return;
    }

    if (!credentials.username || !credentials.password) {
      toast({
        title: "अधूरी जानकारी",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate processing time for security
    await new Promise(resolve => setTimeout(resolve, 1500));

    const isValidCredential = ADMIN_CREDENTIALS.some(
      cred => cred.username === credentials.username && cred.password === credentials.password
    );

    if (isValidCredential) {
      // Clear any lockout data on successful login
      localStorage.removeItem('admin_lockout');
      
      // Set session with expiration
      const sessionData = {
        username: credentials.username,
        loginTime: Date.now(),
        expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
      };
      localStorage.setItem('ivf_admin_session', JSON.stringify(sessionData));
      localStorage.setItem('ivf_admin_logged_in', 'true');
      
      toast({
        title: "प्रवेश सफल",
        description: `Welcome ${credentials.username}! Session valid for 2 hours.`,
      });
      onLogin();
    } else {
      recordAttempt(true);
      toast({
        title: "गलत जानकारी",
        description: `Invalid credentials. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`,
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivf-yellow/10 to-ivf-skyblue/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-ivf-skyblue/20 bg-white/95">
        <CardHeader className="bg-gradient-to-r from-ivf-navy to-ivf-skyblue text-white text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo/fe9e529b-3306-4ddc-b209-d3aa4be7816c.png" 
              alt="International Vaish Federation Logo" 
              className="h-12 w-12 mr-3"
            />
            <Heart className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-mukta">
            सुरक्षित प्रशासक प्रवेश
          </CardTitle>
          <CardDescription className="text-white/90">
            Secure Admin Login - Blood Donation Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-ivf-navy flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                उपयोगकर्ता नाम / Username
              </Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="border-ivf-skyblue/30 focus:border-ivf-skyblue"
                placeholder="Enter admin username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-ivf-navy flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                पासवर्ड / Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="border-ivf-skyblue/30 focus:border-ivf-skyblue pr-10"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {attempts > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">
                  ⚠️ {attempts} failed attempt{attempts > 1 ? 's' : ''}. 
                  {MAX_ATTEMPTS - attempts} remaining before lockout.
                </p>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting || checkLockout() > 0}
              className="w-full bg-ivf-red hover:bg-ivf-red/90 text-white font-medium py-3 disabled:opacity-50"
            >
              {isSubmitting ? 'प्रवेश हो रहा है... / Authenticating...' : 'सुरक्षित प्रवेश / Secure Login'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="font-mukta">
              🔒 एडवांस्ड सिक्यूरिटी | Advanced Security System
            </p>
            <p className="text-xs mt-2 text-gray-500">
              Session expires in 2 hours • Max 3 attempts • 15min lockout
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
