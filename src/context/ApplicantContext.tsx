import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Applicant, RecruitmentStatus, createDefaultRecruitmentStatus } from '@/types/applicant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApplicantContextType {
  applicants: Applicant[];
  addApplicant: (data: Omit<Applicant, 'id' | 'no' | 'recruitmentStatus' | 'isSeparateManagement' | 'files' | 'createdAt' | 'updatedAt'>) => void;
  updateApplicant: (id: string, data: Partial<Applicant>) => void;
  deleteApplicant: (id: string) => void;
  getApplicant: (id: string) => Applicant | undefined;
  loading: boolean;
}

const ApplicantContext = createContext<ApplicantContextType | null>(null);

function mapRow(row: any): Applicant {
  return {
    id: row.id,
    no: row.no,
    jobPostingId: row.job_posting_id,
    team: row.team,
    name: row.name,
    platform: row.platform,
    birthYear: row.birth_year,
    email: row.email,
    phone: row.phone,
    region: row.region,
    regionDetail: row.region_detail,
    school: row.school,
    major: row.major,
    career: row.career,
    memo: row.memo,
    applicationDate: row.application_date,
    recruitmentStatus: row.recruitment_status as RecruitmentStatus,
    isSeparateManagement: row.is_separate_management,
    separateReason: row.separate_reason || undefined,
    files: [], // files remain client-side for now
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function ApplicantProvider({ children }: { children: React.ReactNode }) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .order('no', { ascending: true });
    if (error) {
      toast({ title: '오류', description: '지원자 목록을 불러오지 못했습니다.', variant: 'destructive' });
      return;
    }
    setApplicants((data || []).map(mapRow));
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('applicants_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applicants' }, () => {
        fetchAll();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const addApplicant = useCallback(async (data: Omit<Applicant, 'id' | 'no' | 'recruitmentStatus' | 'isSeparateManagement' | 'files' | 'createdAt' | 'updatedAt'>) => {
    // Get max no
    const { data: maxData } = await supabase
      .from('applicants')
      .select('no')
      .order('no', { ascending: false })
      .limit(1);
    const maxNo = maxData && maxData.length > 0 ? maxData[0].no : 0;

    const { error } = await supabase.from('applicants').insert({
      no: maxNo + 1,
      job_posting_id: data.jobPostingId,
      team: data.team,
      name: data.name,
      platform: data.platform,
      birth_year: data.birthYear,
      email: data.email,
      phone: data.phone,
      region: data.region,
      region_detail: data.regionDetail,
      school: data.school,
      major: data.major,
      career: data.career,
      memo: data.memo,
      application_date: data.applicationDate,
      recruitment_status: createDefaultRecruitmentStatus() as any,
      is_separate_management: false,
    });
    if (error) toast({ title: '오류', description: '지원자 등록 실패', variant: 'destructive' });
  }, [toast]);

  const updateApplicant = useCallback(async (id: string, data: Partial<Applicant>) => {
    const updates: any = {};
    if (data.team !== undefined) updates.team = data.team;
    if (data.name !== undefined) updates.name = data.name;
    if (data.jobPostingId !== undefined) updates.job_posting_id = data.jobPostingId;
    if (data.platform !== undefined) updates.platform = data.platform;
    if (data.birthYear !== undefined) updates.birth_year = data.birthYear;
    if (data.email !== undefined) updates.email = data.email;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.region !== undefined) updates.region = data.region;
    if (data.regionDetail !== undefined) updates.region_detail = data.regionDetail;
    if (data.school !== undefined) updates.school = data.school;
    if (data.major !== undefined) updates.major = data.major;
    if (data.career !== undefined) updates.career = data.career;
    if (data.memo !== undefined) updates.memo = data.memo;
    if (data.applicationDate !== undefined) updates.application_date = data.applicationDate;
    if (data.recruitmentStatus !== undefined) updates.recruitment_status = data.recruitmentStatus as any;
    if (data.isSeparateManagement !== undefined) updates.is_separate_management = data.isSeparateManagement;
    if (data.separateReason !== undefined) updates.separate_reason = data.separateReason;
    if (data.separateReason === undefined && data.isSeparateManagement === false) updates.separate_reason = null;

    const { error } = await supabase.from('applicants').update(updates).eq('id', id);
    if (error) toast({ title: '오류', description: '지원자 수정 실패', variant: 'destructive' });
  }, [toast]);

  const deleteApplicant = useCallback(async (id: string) => {
    const { error } = await supabase.from('applicants').delete().eq('id', id);
    if (error) toast({ title: '오류', description: '지원자 삭제 실패', variant: 'destructive' });
  }, [toast]);

  const getApplicant = useCallback((id: string) => {
    return applicants.find(a => a.id === id);
  }, [applicants]);

  return (
    <ApplicantContext.Provider value={{ applicants, addApplicant, updateApplicant, deleteApplicant, getApplicant, loading }}>
      {children}
    </ApplicantContext.Provider>
  );
}

export function useApplicants() {
  const ctx = useContext(ApplicantContext);
  if (!ctx) throw new Error('useApplicants must be used within ApplicantProvider');
  return ctx;
}
