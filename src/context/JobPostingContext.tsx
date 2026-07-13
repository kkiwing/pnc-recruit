import React, { createContext, useContext, useState, useCallback } from 'react';
import { JobPosting } from '@/types/jobPosting';
import { dummyJobPostings } from '@/data/dummyJobPostings';

const CURRENT_USER = 'admin';

interface JobPostingContextType {
  jobPostings: JobPosting[];
  addJobPosting: (data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => void;
  updateJobPosting: (id: string, data: Partial<JobPosting>) => void;
  deleteJobPosting: (id: string) => void;
  getJobPosting: (id: string) => JobPosting | undefined;
}

const JobPostingContext = createContext<JobPostingContextType | null>(null);

export function JobPostingProvider({ children }: { children: React.ReactNode }) {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(dummyJobPostings);

  const addJobPosting = useCallback((data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    const now = new Date().toISOString();
    const newPosting: JobPosting = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      createdBy: CURRENT_USER,
      updatedBy: CURRENT_USER,
    };
    setJobPostings(prev => [...prev, newPosting]);
  }, []);

  const updateJobPosting = useCallback((id: string, data: Partial<JobPosting>) => {
    setJobPostings(prev => prev.map(j =>
      j.id === id ? { ...j, ...data, updatedAt: new Date().toISOString(), updatedBy: CURRENT_USER } : j
    ));
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
