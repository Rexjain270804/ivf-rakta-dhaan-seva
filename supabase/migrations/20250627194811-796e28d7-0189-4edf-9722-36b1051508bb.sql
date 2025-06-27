
-- Create a table to store blood donation registrations
CREATE TABLE public.blood_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  relation_prefix TEXT NOT NULL,
  mobile TEXT NOT NULL,
  address TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  last_donation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Since no authentication is required, we'll make this table publicly accessible
-- Enable Row Level Security but allow all operations
ALTER TABLE public.blood_donations ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public access (no authentication required)
CREATE POLICY "Allow public insert" 
  ON public.blood_donations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public select" 
  ON public.blood_donations 
  FOR SELECT 
  USING (true);

-- Add an index on email for faster lookups
CREATE INDEX idx_blood_donations_email ON public.blood_donations(email);

-- Add an index on created_at for better performance when ordering
CREATE INDEX idx_blood_donations_created_at ON public.blood_donations(created_at);
