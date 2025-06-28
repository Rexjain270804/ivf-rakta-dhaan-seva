
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CertificateDownload from "./CertificateDownload";

interface FormData {
  fullName: string;
  email: string;
  relationPrefix: string;
  mobile: string;
  address: string;
  bloodGroup: string;
  lastDonationDate: string;
}

const BloodDonationForm = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    relationPrefix: '',
    mobile: '',
    address: '',
    bloodGroup: '',
    lastDonationDate: '',
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const relationPrefixes = [
    { value: 'श्री', label: 'श्री (Mr.)' },
    { value: 'सुश्री', label: 'सुश्री (Ms.)' },
    { value: 'श्रीमती', label: 'श्रीमती (Mrs.)' },
  ];

  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateInputChange = (value: string) => {
    // Allow only numbers and forward slashes
    const cleanValue = value.replace(/[^\d/]/g, '');
    
    // Auto-format as user types
    let formattedValue = cleanValue;
    if (cleanValue.length >= 2 && !cleanValue.includes('/')) {
      formattedValue = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2);
    } else if (cleanValue.length >= 5 && cleanValue.split('/').length === 2) {
      const parts = cleanValue.split('/');
      formattedValue = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2);
    }
    
    // Limit to 10 characters (dd/mm/yyyy)
    if (formattedValue.length <= 10) {
      handleInputChange('lastDonationDate', formattedValue);
    }
  };

  const validateDate = (dateString: string) => {
    if (!dateString) return true; // Optional field
    
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(dateString)) return false;
    
    const [day, month, year] = dateString.split('/').map(num => parseInt(num));
    const date = new Date(year, month - 1, day);
    
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year &&
           date <= new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.relationPrefix || 
        !formData.mobile || !formData.address || !formData.bloodGroup) {
      toast({
        title: "कृपया सभी आवश्यक फील्ड भरें",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "अमान्य ईमेल पता",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      toast({
        title: "अमान्य मोबाइल नंबर",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    // Date validation
    if (formData.lastDonationDate && !validateDate(formData.lastDonationDate)) {
      toast({
        title: "अमान्य तारीख",
        description: "Please enter a valid date in DD/MM/YYYY format",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting form data:', formData);
      
      // Convert date format for database (dd/mm/yyyy to yyyy-mm-dd)
      let dbDate = null;
      if (formData.lastDonationDate) {
        const [day, month, year] = formData.lastDonationDate.split('/');
        dbDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Prepare data for insertion
      const insertData = {
        full_name: formData.fullName,
        email: formData.email,
        relation_prefix: formData.relationPrefix,
        mobile: formData.mobile,
        address: formData.address,
        blood_group: formData.bloodGroup,
        last_donation_date: dbDate
      };

      console.log('Insert data:', insertData);

      // Save to Supabase
      const { data, error } = await supabase
        .from('blood_donations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "पंजीकरण में त्रुटि",
          description: `Registration failed: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Registration saved successfully:', data);

      // Send email with certificate
      try {
        const emailResponse = await supabase.functions.invoke('send-certificate', {
          body: {
            email: formData.email,
            fullName: formData.fullName,
            relationPrefix: formData.relationPrefix,
            bloodGroup: formData.bloodGroup,
            registrationId: data.id
          }
        });

        if (emailResponse.error) {
          console.error('Email error:', emailResponse.error);
          // Still show success as registration was saved
          toast({
            title: "पंजीकरण सफल!",
            description: "Registration successful but email could not be sent. Please contact us for your certificate.",
          });
        } else {
          console.log('Email sent successfully');
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Still show success as registration was saved
      }

      setSubmitted(true);
      
      toast({
        title: "धन्यवाद! Thank you!",
        description: "आपका पंजीकरण सफल रहा है। Your registration is successful.",
      });

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "पंजीकरण में त्रुटि",
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivf-yellow/10 to-ivf-skyblue/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto shadow-2xl border-ivf-skyblue/20">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <img 
                src="/logo/fe9e529b-3306-4ddc-b209-d3aa4be7816c.png" 
                alt="International Vaish Federation Logo" 
                className="h-20 w-20 mx-auto mb-4"
              />
              <Heart className="h-16 w-16 text-ivf-red mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-ivf-navy mb-2 font-mukta">
                धन्यवाद! Thank You!
              </h2>
              <p className="text-lg text-gray-600 mb-4 font-mukta">
                आपका पंजीकरण सफल रहा है
              </p>
              <p className="text-sm text-gray-500">
                Your registration for the Blood Donation Camp has been successfully completed.<br/>
                <b>Download your certificate below.</b>
              </p>
            </div>
            <CertificateDownload 
              name={`${formData.relationPrefix} ${formData.fullName}`} 
              show={true} 
            />
            <div className="bg-ivf-yellow/10 p-4 rounded-lg mb-6">
              <p className="text-sm text-ivf-navy font-medium">
                <strong>Registration Details:</strong><br />
                Name: {formData.relationPrefix} {formData.fullName}<br />
                Email: {formData.email}<br />
                Blood Group: {formData.bloodGroup}
              </p>
            </div>
            
            <Button 
              onClick={() => setSubmitted(false)}
              className="bg-ivf-red hover:bg-ivf-red/90 text-white font-medium px-8 py-2"
            >
              Register Another Person
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivf-yellow/10 to-ivf-skyblue/10 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo/fe9e529b-3306-4ddc-b209-d3aa4be7816c.png" 
              alt="International Vaish Federation Logo" 
              className="h-16 w-16 mr-4"
            />
            <div>
              <div className="flex items-center justify-center mb-2">
                <h1 className="text-4xl font-bold text-ivf-navy font-mukta">
                  रक्तदान शिविर
                </h1>
              </div>
              <h2 className="text-2xl font-semibold text-ivf-navy mb-2 font-poppins">
                Blood Donation Camp
              </h2>
            </div>
          </div>
          <p className="text-lg text-ivf-navy/80 font-mukta">
            अंतर्राष्ट्रीय वैश्य महासम्मेलन द्वारा आयोजित
          </p>
          <p className="text-sm text-gray-600 font-poppins">
            Organized by International Vaish Federation
          </p>
          <p className="text-sm text-gray-600 font-poppins">
            Bikaner Chapter
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-2xl border-ivf-skyblue/20 bg-white/95">
          <CardHeader className="bg-gradient-to-r from-ivf-navy to-ivf-skyblue text-white">
            <CardTitle className="text-2xl font-mukta">
              पंजीकरण फॉर्म / Registration Form
            </CardTitle>
            <CardDescription className="text-white/90">
              कृपया सभी आवश्यक जानकारी भरें / Please fill in all required information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Relation Prefix */}
                <div className="space-y-2">
                  <Label htmlFor="relationPrefix" className="text-sm font-medium text-ivf-navy">
                    संबोधन / Relation Prefix *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('relationPrefix', value)}>
                    <SelectTrigger className="border-ivf-skyblue/30 focus:border-ivf-skyblue">
                      <SelectValue placeholder="चुनें / Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationPrefixes.map((prefix) => (
                        <SelectItem key={prefix.value} value={prefix.value}>
                          {prefix.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-ivf-navy">
                    पूरा नाम / Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="border-ivf-skyblue/30 focus:border-ivf-skyblue"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-ivf-navy">
                    ईमेल पता / Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="border-ivf-skyblue/30 focus:border-ivf-skyblue"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium text-ivf-navy">
                    मोबाइल नंबर / Mobile Number *
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="border-ivf-skyblue/30 focus:border-ivf-skyblue"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="text-sm font-medium text-ivf-navy">
                    रक्त समूह / Blood Group *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                    <SelectTrigger className="border-ivf-skyblue/30 focus:border-ivf-skyblue">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Last Donation Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-ivf-navy">
                    अंतिम रक्तदान की तारीख / Last Donation Date
                  </Label>
                  <Input
                    type="text"
                    value={formData.lastDonationDate}
                    onChange={(e) => handleDateInputChange(e.target.value)}
                    className="border-ivf-skyblue/30 focus:border-ivf-skyblue"
                    placeholder="DD/MM/YYYY (optional)"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500">Format: DD/MM/YYYY (e.g., 15/03/2023)</p>
                </div>
              </div>

              {/* Address - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-ivf-navy">
                  पता / Address *
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="border-ivf-skyblue/30 focus:border-ivf-skyblue"
                  placeholder="Enter your complete address"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ivf-red hover:bg-ivf-red/90 text-white font-medium py-3 text-lg disabled:opacity-50"
              >
                {isSubmitting ? 'पंजीकरण हो रहा है... / Registering...' : 'पंजीकरण करें / Register Now'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p className="font-mukta">
            सेवा ही धर्म है | Service is Religion
          </p>
          <p className="font-poppins">
            International Vaish Federation - Serving Humanity
          </p>
          <p className="font-poppins">
            Designed By Rishabh Bothra Contact +91-8955226422
          </p>
        </div>
      </div>
    </div>
  );
};

export default BloodDonationForm;
