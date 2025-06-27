
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Simple password check - in production, use proper authentication
  const ADMIN_PASSWORD = 'ivf2024admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === ADMIN_PASSWORD) {
      toast({
        title: "प्रवेश सफल",
        description: "Welcome to Admin Dashboard",
      });
      onLogin();
    } else {
      toast({
        title: "गलत पासवर्ड",
        description: "Incorrect password. Please try again.",
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
            प्रशासक प्रवेश
          </CardTitle>
          <CardDescription className="text-white/90">
            Admin Login - Blood Donation Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-ivf-navy flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                पासवर्ड / Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-ivf-skyblue/30 focus:border-ivf-skyblue"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-ivf-red hover:bg-ivf-red/90 text-white font-medium py-3 disabled:opacity-50"
            >
              {isSubmitting ? 'प्रवेश हो रहा है... / Logging in...' : 'प्रवेश करें / Login'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="font-mukta">
              सुरक्षित प्रवेश | Secure Access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
