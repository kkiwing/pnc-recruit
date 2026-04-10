import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { JobPosting } from '@/types/jobPosting';
import { dummyJobPostings } from '@/data/dummyJobPostings';

interface JobPostingContextType {
  jobPostings: JobPosting[];
  addJobPosting: (data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJobPosting: (id: string, data: Partial<JobPosting>) => void;
  deleteJobPosting: (id: string) => void;
  getJobPosting: (id: string) => JobPosting | undefined;
}

const JobPostingContext = createContext<JobPostingContextType | null>(null);

const STORAGE_KEY = 'pnc-job-postings';
const DUMMY_LOADED_KEY = 'pnc-job-postings-dummy-loaded';

export function JobPostingProvider({ children }: { children: React.ReactNode }) {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      if (!localStorage.getItem(DUMMY_LOADED_KEY)) {
        localStorage.setItem(DUMMY_LOADED_KEY, 'true');
        return dummyJobPostings;
      }
      return [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobPostings));
  }, [jobPostings]);

  const addJobPosting = useCallback((data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setJobPostings(prev => [...prev, { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }]);
  }, []);

  const updateJobPosting = useCallback((id: string, data: Partial<JobPosting>) => {
    setJobPostings(prev => prev.map(j => j.id === id ? { ...j, ...data, updatedAt: new Date().toISOString() } : j));
  }, []);

  const deleteJobPosting = useCallback((id: string) => {
    setJobPostings(prev => prev.filter(j => j.id !== id));
  }, []);

  const getJobPosting = useCallback((id: string) => {
    return jobPostings.find(j => j.id === id);
  }, [jobPostings]);

  return (
    <JobPostingContext.Provider value={{ jobPostings, addJobPosting, updateJobPosting, deleteJobPosting, getJobPosting }}>
      {children}
    </JobPostingContext.Provider>
  );
}

export function useJobPostings() {
  const ctx = useContext(JobPostingContext);
  if (!ctx) throw new Error('useJobPostings must be used within JobPostingProvider');
  return ctx;
}
