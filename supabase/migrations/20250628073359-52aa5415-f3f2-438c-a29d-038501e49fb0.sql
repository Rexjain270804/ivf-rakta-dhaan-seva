
-- Remove the relation_prefix column from blood_donations table
ALTER TABLE public.blood_donations DROP COLUMN IF EXISTS relation_prefix;
