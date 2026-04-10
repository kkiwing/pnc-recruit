import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobPostings } from '@/context/JobPostingContext';
import { useApplicants } from '@/context/ApplicantContext';
import ApplicantTable from '@/components/applicant/ApplicantTable';
import ApplicantFormModal from '@/components/applicant/ApplicantFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Search, Users, UserX } from 'lucide-react';

export default function JobPostingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobPosting } = useJobPostings();
  const { applicants } = useApplicants();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const jobPosting = id ? getJobPosting(id) : undefined;

  if (!jobPosting) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">공고를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/postings')}>
          목록으로
        </Button>
      </div>
    );
  }

  const jobApplicants = applicants.filter(a => a.jobPostingId === jobPosting.id);
  const activeApplicants = jobApplicants.filter(a => !a.isSeparateManagement);
  const separateApplicants = jobApplicants.filter(a => a.isSeparateManagement);

  const filteredActive = activeApplicants.filter(a =>
    !search || a.name.includes(search) || a.team.includes(search) || a.email.includes(search)
  );
  const filteredSeparate = separateApplicants.filter(a =>
    !search || a.name.includes(search) || a.team.includes(search) || a.email.includes(search)
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-1">
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => navigate('/postings')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">{jobPosting.title}</h2>
          <p className="text-xs text-muted-foreground">{jobPosting.department} · {jobPosting.startDate} ~ {jobPosting.endDate}</p>
        </div>
      </div>

      <Tabs defaultValue="applicants" className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="applicants" className="gap-1.5">
              <Users className="w-3.5 h-3.5" />
              지원자 목록 ({activeApplicants.length})
            </TabsTrigger>
            <TabsTrigger value="separate" className="gap-1.5">
              <UserX className="w-3.5 h-3.5" />
              별도 관리 ({separateApplicants.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 w-60"
                placeholder="이름, 팀, 이메일 검색"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> 지원자 등록
            </Button>
          </div>
        </div>

        <TabsContent value="applicants">
          <div className="bg-card rounded-lg border shadow-sm">
            <ApplicantTable applicants={filteredActive} />
          </div>
        </TabsContent>

        <TabsContent value="separate">
          <div className="bg-card rounded-lg border shadow-sm">
            <ApplicantTable applicants={filteredSeparate} showSeparateActions />
          </div>
        </TabsContent>
      </Tabs>

      {showForm && (
        <ApplicantFormModal open={showForm} onClose={() => setShowForm(false)} defaultJobPostingId={jobPosting.id} />
      )}
    </div>
  );
}
