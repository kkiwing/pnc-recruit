import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { JobPosting } from '@/types/jobPosting';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobPostingContextType {
  jobPostings: JobPosting[];
  addJobPosting: (data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJobPosting: (id: string, data: Partial<JobPosting>) => void;
  deleteJobPosting: (id: string) => void;
  getJobPosting: (id: string) => JobPosting | undefined;
  loading: boolean;
}

const JobPostingContext = createContext<JobPostingContextType | null>(null);

function mapRow(row: any): JobPosting {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    status: row.status as JobPosting['status'],
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function JobPostingProvider({ children }: { children: React.ReactNode }) {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: '오류', description: '공고 목록을 불러오지 못했습니다.', variant: 'destructive' });
      return;
    }
    setJobPostings((data || []).map(mapRow));
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('job_postings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_postings' }, () => {
        fetchAll();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const addJobPosting = useCallback(async (data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase.from('job_postings').insert({
      title: data.title,
      department: data.department,
      status: data.status,
      start_date: data.startDate,
      end_date: data.endDate,
      description: data.description,
    });
    if (error) toast({ title: '오류', description: '공고 등록 실패', variant: 'destructive' });
  }, [toast]);

  const updateJobPosting = useCallback(async (id: string, data: Partial<JobPosting>) => {
    const updates: any = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.department !== undefined) updates.department = data.department;
    if (data.status !== undefined) updates.status = data.status;
    if (data.startDate !== undefined) updates.start_date = data.startDate;
    if (data.endDate !== undefined) updates.end_date = data.endDate;
    if (data.description !== undefined) updates.description = data.description;
    const { error } = await supabase.from('job_postings').update(updates).eq('id', id);
    if (error) toast({ title: '오류', description: '공고 수정 실패', variant: 'destructive' });
  }, [toast]);

  const deleteJobPosting = useCallback(async (id: string) => {
    const { error } = await supabase.from('job_postings').delete().eq('id', id);
    if (error) toast({ title: '오류', description: '공고 삭제 실패', variant: 'destructive' });
  }, [toast]);

  const getJobPosting = useCallback((id: string) => {
    return jobPostings.find(j => j.id === id);
  }, [jobPostings]);

  return (
    <JobPostingContext.Provider value={{ jobPostings, addJobPosting, updateJobPosting, deleteJobPosting, getJobPosting, loading }}>
      {children}
    </JobPostingContext.Provider>
  );
}

export function useJobPostings() {
  const ctx = useContext(JobPostingContext);
  if (!ctx) throw new Error('useJobPostings must be used within JobPostingProvider');
  return ctx;
}
