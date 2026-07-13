import React, { createContext, useContext, useState, useCallback } from 'react';
import { Applicant } from '@/types/applicant';
import { dummyApplicants } from '@/data/dummyApplicants';

interface ApplicantContextType {
  applicants: Applicant[];
  addApplicant: (data: Omit<Applicant, 'id' | 'no' | 'isSeparateManagement' | 'files' | 'createdAt' | 'updatedAt'>) => void;
  updateApplicant: (id: string, data: Partial<Applicant>) => void;
  deleteApplicant: (id: string) => void;
  deleteApplicantsByJobPostingId: (jobPostingId: string) => void;
  getApplicant: (id: string) => Applicant | undefined;
}

const ApplicantContext = createContext<ApplicantContextType | null>(null);

export function ApplicantProvider({ children }: { children: React.ReactNode }) {
  const [applicants, setApplicants] = useState<Applicant[]>(dummyApplicants);

  const addApplicant = useCallback((data: Omit<Applicant, 'id' | 'no' | 'isSeparateManagement' | 'files' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setApplicants(prev => {
      const maxNo = prev.reduce((max, a) => Math.max(max, a.no), 0);
      const newApplicant: Applicant = {
        ...data,
        id: crypto.randomUUID(),
        no: maxNo + 1,
        isSeparateManagement: false,
        files: [],
        createdAt: now,
        updatedAt: now,
      };
      return [...prev, newApplicant];
    });
  }, []);

  const updateApplicant = useCallback((id: string, data: Partial<Applicant>) => {
    setApplicants(prev => prev.map(a =>
      a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
    ));
  }, []);

  const deleteApplicant = useCallback((id: string) => {
    setApplicants(prev => prev.filter(a => a.id !== id));
  }, []);

  const deleteApplicantsByJobPostingId = useCallback((jobPostingId: string) => {
    setApplicants(prev => prev.filter(a => a.jobPostingId !== jobPostingId));
  }, []);

  const getApplicant = useCallback((id: string) => {
    return applicants.find(a => a.id === id);
  }, [applicants]);

  return (
    <ApplicantContext.Provider value={{ applicants, addApplicant, updateApplicant, deleteApplicant, deleteApplicantsByJobPostingId, getApplicant }}>
      {children}
    </ApplicantContext.Provider>
  );
}

export function useApplicants() {
  const ctx = useContext(ApplicantContext);
  if (!ctx) throw new Error('useApplicants must be used within ApplicantProvider');
  return ctx;
}
