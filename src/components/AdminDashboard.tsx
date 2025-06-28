
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Users, Calendar, Mail, Phone, MapPin, Droplet, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BloodDonation {
  id: string;
  full_name: string;
  email: string;
  relation_prefix: string;
  mobile: string;
  address: string;
  blood_group: string;
  last_donation_date: string | null;
  created_at: string;
  updated_at: string;
}

const AdminDashboard = () => {
  const [donations, setDonations] = useState<BloodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const fetchDonations = async () => {
    try {
      const { data, error, count } = await supabase
        .from('blood_donations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching donations:', error);
        toast({
          title: "Error",
          description: "Failed to fetch donations data",
          variant: "destructive",
        });
        return;
      }

      setDonations(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch donations data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();

    // Set up real-time subscription
    const channel = supabase
      .channel('blood-donations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blood_donations'
        },
        (payload) => {
          console.log('New registration:', payload);
          setDonations(prev => [payload.new as BloodDonation, ...prev]);
          setTotalCount(prev => prev + 1);
          toast({
            title: "New Registration!",
            description: `${payload.new.relation_prefix} ${payload.new.full_name} has registered for blood donation`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const exportToExcel = () => {
    if (donations.length === 0) {
      toast({
        title: "No Data",
        description: "No registrations available to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = [
      'S.No.',
      'Registration Date',
      'Relation Prefix',
      'Full Name',
      'Email',
      'Mobile',
      'Address',
      'Blood Group',
      'Last Donation Date'
    ];

    const csvContent = [
      headers.join(','),
      ...donations.map((donation, index) => [
        index + 1,
        format(new Date(donation.created_at), 'dd/MM/yyyy HH:mm'),
        `"${donation.relation_prefix}"`,
        `"${donation.full_name}"`,
        `"${donation.email}"`,
        `"${donation.mobile}"`,
        `"${donation.address}"`,
        `"${donation.blood_group}"`,
        donation.last_donation_date ? format(new Date(donation.last_donation_date), 'dd/MM/yyyy') : 'First Time'
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `blood-donations-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Registration data has been exported to CSV file",
    });
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: { [key: string]: string } = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-200 text-blue-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-200 text-green-900',
    };
    return colors[bloodGroup] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivf-yellow/10 to-ivf-skyblue/10 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-ivf-red mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-ivf-navy">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivf-yellow/10 to-ivf-skyblue/10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo/fe9e529b-3306-4ddc-b209-d3aa4be7816c.png" 
              alt="International Vaish Federation Logo" 
              className="h-16 w-16 mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold text-ivf-navy font-mukta">
                प्रशासक डैशबोर्ड
              </h1>
              <h2 className="text-2xl font-semibold text-ivf-navy mb-2 font-poppins">
                Admin Dashboard - Blood Donation Registrations
              </h2>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 border-ivf-skyblue/20">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-ivf-skyblue mx-auto mb-2" />
              <p className="text-2xl font-bold text-ivf-navy">{totalCount}</p>
              <p className="text-sm text-gray-600">Total Registrations</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-ivf-skyblue/20">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-ivf-red mx-auto mb-2" />
              <p className="text-2xl font-bold text-ivf-navy">
                {donations.filter(d => d.created_at >= new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).length}
              </p>
              <p className="text-sm text-gray-600">Today's Registrations</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-ivf-skyblue/20">
            <CardContent className="p-4 text-center">
              <Droplet className="h-8 w-8 text-ivf-yellow mx-auto mb-2" />
              <p className="text-2xl font-bold text-ivf-navy">
                {new Set(donations.map(d => d.blood_group)).size}
              </p>
              <p className="text-sm text-gray-600">Blood Groups</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-ivf-skyblue/20">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-ivf-navy mx-auto mb-2" />
              <p className="text-2xl font-bold text-ivf-navy">
                {donations.filter(d => d.last_donation_date).length}
              </p>
              <p className="text-sm text-gray-600">Previous Donors</p>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card className="shadow-2xl border-ivf-skyblue/20 bg-white/95">
          <CardHeader className="bg-gradient-to-r from-ivf-navy to-ivf-skyblue text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-mukta flex items-center">
                  <Heart className="h-6 w-6 mr-2" />
                  रियल-टाइम पंजीकरण / Real-time Registrations
                </CardTitle>
                <CardDescription className="text-white/90">
                  Live updates of blood donation registrations
                </CardDescription>
              </div>
              <Button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={donations.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {donations.length === 0 ? (
              <div className="p-8 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No registrations yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Last Donation</TableHead>
                      <TableHead>Registered At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold text-ivf-navy">
                              {donation.relation_prefix} {donation.full_name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-gray-500" />
                              <span className="truncate max-w-[150px]">{donation.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1 text-gray-500" />
                              <span>{donation.mobile}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBloodGroupColor(donation.blood_group)}>
                            {donation.blood_group}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                            <span className="truncate max-w-[200px]">{donation.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {donation.last_donation_date ? (
                            <span className="text-sm">
                              {format(new Date(donation.last_donation_date), 'dd/MM/yyyy')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">First time</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(new Date(donation.created_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
