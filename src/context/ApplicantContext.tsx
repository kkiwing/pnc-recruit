import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Applicant, createDefaultRecruitmentStatus } from '@/types/applicant';

interface ApplicantContextType {
  applicants: Applicant[];
  addApplicant: (data: Omit<Applicant, 'id' | 'no' | 'recruitmentStatus' | 'isSeparateManagement' | 'files' | 'createdAt' | 'updatedAt'>) => void;
  updateApplicant: (id: string, data: Partial<Applicant>) => void;
  deleteApplicant: (id: string) => void;
  getApplicant: (id: string) => Applicant | undefined;
}

const ApplicantContext = createContext<ApplicantContextType | null>(null);

const STORAGE_KEY = 'pnc-applicants';

export function ApplicantProvider({ children }: { children: React.ReactNode }) {
  const [applicants, setApplicants] = useState<Applicant[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
  }, [applicants]);

  const addApplicant = useCallback((data: Omit<Applicant, 'id' | 'no' | 'recruitmentStatus' | 'isSeparateManagement' | 'files' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const maxNo = applicants.length > 0 ? Math.max(...applicants.map(a => a.no)) : 0;
    const newApplicant: Applicant = {
      ...data,
      id: crypto.randomUUID(),
      no: maxNo + 1,
      recruitmentStatus: createDefaultRecruitmentStatus(),
      isSeparateManagement: false,
      files: [],
      createdAt: now,
      updatedAt: now,
    };
    setApplicants(prev => [...prev, newApplicant]);
  }, [applicants]);

  const updateApplicant = useCallback((id: string, data: Partial<Applicant>) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a));
  }, []);

  const deleteApplicant = useCallback((id: string) => {
    setApplicants(prev => prev.filter(a => a.id !== id));
  }, []);

  const getApplicant = useCallback((id: string) => {
    return applicants.find(a => a.id === id);
  }, [applicants]);

  return (
    <ApplicantContext.Provider value={{ applicants, addApplicant, updateApplicant, deleteApplicant, getApplicant }}>
      {children}
    </ApplicantContext.Provider>
  );
}

export function useApplicants() {
  const ctx = useContext(ApplicantContext);
  if (!ctx) throw new Error('useApplicants must be used within ApplicantProvider');
  return ctx;
}
