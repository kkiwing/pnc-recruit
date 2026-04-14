-- Create job_postings table
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applicants table
CREATE TABLE public.applicants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  no INTEGER NOT NULL,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  team TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT '',
  birth_year TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  region_detail TEXT NOT NULL DEFAULT '',
  school TEXT NOT NULL DEFAULT '',
  major TEXT NOT NULL DEFAULT '',
  career TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  application_date TEXT NOT NULL DEFAULT '',
  recruitment_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_separate_management BOOLEAN NOT NULL DEFAULT false,
  separate_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

-- Permissive policies for internal admin tool (no auth)
CREATE POLICY "Allow all access to job_postings" ON public.job_postings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to applicants" ON public.applicants FOR ALL USING (true) WITH CHECK (true);

-- Index
CREATE INDEX idx_applicants_job_posting_id ON public.applicants(job_posting_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applicants_updated_at
  BEFORE UPDATE ON public.applicants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
