import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileAttachment, StageRecord, getStageRecordStatus } from '@/types/applicant';
import { Stage, getStageColorHex } from '@/types/jobPosting';
import { ArrowLeft, FileText, Upload, Trash2, Clock } from 'lucide-react';
import CompletionDateModal from '@/components/applicant/CompletionDateModal';
import StatusBadge from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';

function StageBadge({ stage, stageRecords, onEditMeta }: { stage: Stage; stageRecords: StageRecord[]; onEditMeta: () => void }) {
  const status = getStageRecordStatus(stageRecords, stage);
  const record = stageRecords.find(r => r.stageId === stage.id);
  const meta = record?.meta;
  const badge = (
    <StatusBadge color={getStageColorHex(status?.color ?? 'gray')} className="px-2 py-1">
      {stage.name}: {status?.name ?? '-'}
    </StatusBadge>
  );
  if (meta && (meta.startDate || meta.interviewer)) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent side="top" className="text-xs space-y-1 max-w-xs">
            {meta.startDate && meta.endDate && <p>기간: {meta.startDate} ~ {meta.endDate}</p>}
            {meta.time && <p>시간: {meta.time}</p>}
            {meta.interviewer && <p>담당자: {meta.interviewer}</p>}
          </TooltipContent>
        </Tooltip>
        <button type="button" className="text-muted-foreground hover:text-foreground" onClick={onEditMeta}>
          <Clock className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }
  return badge;
}

export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getApplicant, updateApplicant } = useApplicants();
  const { jobPostings } = useJobPostings();
  const applicant = id ? getApplicant(id) : undefined;
  const [memo, setMemo] = useState(applicant?.memo ?? '');
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  if (!applicant) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">지원자를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/applicants')}>
          목록으로
        </Button>
      </div>
    );
  }

  const jobPosting = jobPostings.find(j => j.id === applicant.jobPostingId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: FileAttachment[] = Array.from(files).map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
      uploadedAt: new Date().toISOString(),
    }));
    updateApplicant(applicant.id, { files: [...applicant.files, ...newFiles] });
  };

  const removeFile = (fileId: string) => {
    updateApplicant(applicant.id, { files: applicant.files.filter(f => f.id !== fileId) });
  };

  const saveMemo = () => {
    updateApplicant(applicant.id, { memo });
  };

  const handleMetaSubmit = (data: { startDate: string; endDate: string; time?: string; interviewer?: string }) => {
    if (!editingStage) return;
    const status = getStageRecordStatus(applicant.stageRecords, editingStage);
    if (!status) return;
    const now = new Date().toISOString();
    const meta = { startDate: data.startDate, endDate: data.endDate, time: data.time, interviewer: data.interviewer };
    const exists = applicant.stageRecords.some(r => r.stageId === editingStage.id);
    const nextRecords = exists
      ? applicant.stageRecords.map(r => r.stageId === editingStage.id ? { stageId: editingStage.id, statusId: status.id, meta, updatedAt: now } : r)
      : [...applicant.stageRecords, { stageId: editingStage.id, statusId: status.id, meta, updatedAt: now }];
    updateApplicant(applicant.id, { stageRecords: nextRecords });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">{applicant.name}</h2>
          <p className="text-xs text-muted-foreground">
            No.{applicant.no} · {applicant.team} · {jobPosting?.title ?? '(삭제된 공고)'}
          </p>
        </div>
        <Badge variant={applicant.submissionStatus === '완료' ? 'success' : 'warning'} className="ml-auto">
          제출 {applicant.submissionStatus}
        </Badge>
      </div>

      <div className="card-elevated p-5 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
          <div><span className="text-muted-foreground">성별:</span> {applicant.gender}</div>
          <div><span className="text-muted-foreground">생년월일:</span> {applicant.birthDate || '-'}</div>
          <div><span className="text-muted-foreground">이메일:</span> {applicant.email}</div>
          <div><span className="text-muted-foreground">휴대전화:</span> {applicant.phone}</div>
          <div><span className="text-muted-foreground">지역:</span> {applicant.region} {applicant.regionDetail}</div>
          <div className="col-span-2"><span className="text-muted-foreground">주소:</span> {applicant.address || '-'}</div>
          <div><span className="text-muted-foreground">지원플랫폼:</span> {applicant.platform}</div>
          <div><span className="text-muted-foreground">지원일:</span> {applicant.applicationDate}</div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">전형 현황</p>
          <div className="flex flex-wrap gap-1.5">
            {jobPosting
              ? [...jobPosting.stages].sort((a, b) => a.order - b.order).map(stage => (
                  <StageBadge key={stage.id} stage={stage} stageRecords={applicant.stageRecords} onEditMeta={() => setEditingStage(stage)} />
                ))
              : <span className="text-xs text-muted-foreground">전형 단계 정보를 찾을 수 없습니다.</span>
            }
          </div>
        </div>
      </div>

      <Tabs defaultValue="resume">
        <TabsList>
          <TabsTrigger value="resume">이력서</TabsTrigger>
          <TabsTrigger value="coverLetter">자기소개서</TabsTrigger>
          <TabsTrigger value="memo">메모</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-4 mt-4">
          <section className="card-elevated p-5">
            <h3 className="text-sm font-semibold mb-3">학력</h3>
            {applicant.educations.length === 0 ? (
              <p className="text-sm text-muted-foreground">등록된 학력이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {applicant.educations.map((edu, i) => (
                  <div key={i} className="text-sm border-b last:border-b-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{edu.schoolName}</span>
                      <span className="text-xs text-muted-foreground">{edu.degree}</span>
                      <span className="text-xs text-muted-foreground">{edu.majorField} · {edu.major}{edu.minor ? ` (부전공: ${edu.minor})` : ''}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {edu.period} · 학점 {edu.gpa.toFixed(2)} / {edu.gpaMax}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card-elevated p-5">
            <h3 className="text-sm font-semibold mb-3">자격증</h3>
            {applicant.certificates.length === 0 ? (
              <p className="text-sm text-muted-foreground">등록된 자격증이 없습니다.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {applicant.certificates.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.issuer} · {c.acquiredDate}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card-elevated p-5">
            <h3 className="text-sm font-semibold mb-3">경력</h3>
            {applicant.careers.length === 0 ? (
              <p className="text-sm text-muted-foreground">신입 지원자입니다.</p>
            ) : (
              <div className="space-y-2">
                {applicant.careers.map((c, i) => (
                  <div key={i} className="text-sm border-b last:border-b-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{c.company}</span>
                      <span className="text-xs text-muted-foreground">{c.role}</span>
                      <span className="text-xs text-muted-foreground">{c.period}</span>
                    </div>
                    {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card-elevated p-5">
            <h3 className="text-sm font-semibold mb-3">활동</h3>
            {applicant.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">등록된 활동이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {applicant.activities.map((a, i) => (
                  <div key={i} className="text-sm border-b last:border-b-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{a.name}</span>
                      <span className="text-xs text-muted-foreground">{a.role} · {a.organization}</span>
                      <span className="text-xs text-muted-foreground">{a.period}</span>
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card-elevated p-5">
            <h3 className="text-sm font-semibold mb-3">통계 패키지</h3>
            {applicant.statisticsPackages.length === 0 ? (
              <p className="text-sm text-muted-foreground">등록된 통계 패키지 활용 경험이 없습니다.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {applicant.statisticsPackages.map((p, i) => (
                  <li key={i}>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">숙련도 {p.level} · {p.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {applicant.thesis && (
            <section className="card-elevated p-5">
              <h3 className="text-sm font-semibold mb-3">논문</h3>
              <p className="text-sm font-medium">{applicant.thesis.title}</p>
              <p className="text-xs text-muted-foreground mt-1">키워드: {applicant.thesis.keyword}</p>
              <p className="text-sm mt-2">{applicant.thesis.summary}</p>
            </section>
          )}
        </TabsContent>

        <TabsContent value="coverLetter" className="mt-4">
          <section className="card-elevated p-5 space-y-5">
            {applicant.coverLetter.length === 0 ? (
              <p className="text-sm text-muted-foreground">제출된 자기소개서가 없습니다.</p>
            ) : (
              applicant.coverLetter.map((answer, i) => {
                const question = jobPosting?.coverLetterQuestions.find(q => q.id === answer.questionId);
                return (
                  <div key={answer.questionId} className={i > 0 ? 'pt-5 border-t' : ''}>
                    <p className="text-sm font-medium mb-2">
                      {question ? question.question : <span className="text-muted-foreground italic">(삭제된 문항)</span>}
                    </p>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{answer.answer}</p>
                  </div>
                );
              })
            )}
          </section>
        </TabsContent>

        <TabsContent value="memo" className="mt-4 space-y-4">
          <section className="card-elevated p-5">
            <Label>특이사항 메모</Label>
            <Textarea value={memo} onChange={e => setMemo(e.target.value)} rows={4} className="mt-1" />
            <Button size="sm" className="mt-2" onClick={saveMemo}>메모 저장</Button>
          </section>

          <section className="card-elevated p-5">
            <div className="flex items-center justify-between mb-2">
              <Label>첨부 파일</Label>
              <label className="cursor-pointer">
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <Upload className="w-3 h-3" /> 파일 추가
                </span>
              </label>
            </div>
            {applicant.files.length === 0 ? (
              <p className="text-sm text-muted-foreground">첨부된 파일이 없습니다.</p>
            ) : (
              <ul className="space-y-1">
                {applicant.files.map(f => (
                  <li key={f.id} className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="truncate max-w-[250px]">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(f.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </TabsContent>
      </Tabs>

      {editingStage && (
        <CompletionDateModal
          open={!!editingStage}
          onClose={() => setEditingStage(null)}
          stepLabel={editingStage.name}
          isInterview={editingStage.completionForm === 'interview'}
          initialData={applicant.stageRecords.find(r => r.stageId === editingStage.id)?.meta}
          onSubmit={handleMetaSubmit}
        />
      )}
    </div>
  );
}
