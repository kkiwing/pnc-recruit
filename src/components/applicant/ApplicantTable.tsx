import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Applicant, REGION_INTERVIEW_FEE, SEPARATE_REASONS, SeparateManagementReason, StageRecord, getCurrentStage, getStageRecordStatus } from '@/types/applicant';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import { JobPosting, Stage, getStageColorClass } from '@/types/jobPosting';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MoreHorizontal, MessageSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import CompletionDateModal from './CompletionDateModal';
import ApplicantFormModal from './ApplicantFormModal';

interface Props {
  applicants: Applicant[];
  showSeparateActions?: boolean;
  /** 제공되면 해당 공고의 단계를 컬럼으로 동적 렌더링. 없으면(여러 공고가 섞인 목록) 현재 단계 요약만 표시. */
  jobPosting?: JobPosting;
}

function StageSelect({ stage, stageRecords, onChange }: { stage: Stage; stageRecords: StageRecord[]; onChange: (statusId: string) => void }) {
  const record = stageRecords.find(r => r.stageId === stage.id);
  const status = record && stage.statuses.find(s => s.id === record.statusId);
  const meta = record?.meta;
  const hasMetaInfo = meta && (meta.startDate || meta.interviewer);

  const select = (
    <select
      className={`text-xs rounded px-1.5 py-1 border-0 cursor-pointer font-medium text-center appearance-none ${getStageColorClass(status?.color ?? 'gray')}`}
      value={record?.statusId ?? ''}
      onChange={e => onChange(e.target.value)}
      style={{ minWidth: '56px' }}
    >
      {stage.statuses.map(s => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );

  if (hasMetaInfo) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{select}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs space-y-1 max-w-xs">
          {meta.startDate && meta.endDate && <p>기간: {meta.startDate} ~ {meta.endDate}</p>}
          {meta.time && <p>시간: {meta.time}</p>}
          {meta.interviewer && <p>담당자: {meta.interviewer}</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return select;
}

export default function ApplicantTable({ applicants, showSeparateActions, jobPosting }: Props) {
  const { updateApplicant, deleteApplicant } = useApplicants();
  const { jobPostings } = useJobPostings();
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState<Applicant | null>(null);
  const [completionModal, setCompletionModal] = useState<{ applicantId: string; stage: Stage; statusId: string } | null>(null);

  const postingsById = new Map(jobPostings.map(j => [j.id, j]));
  const sortedStages = jobPosting ? [...jobPosting.stages].sort((a, b) => a.order - b.order) : [];

  const handleSeparateManagement = (applicant: Applicant, reason: SeparateManagementReason) => {
    updateApplicant(applicant.id, {
      isSeparateManagement: true,
      separateReason: reason,
    });
  };

  const handleRestoreApplicant = (applicant: Applicant) => {
    updateApplicant(applicant.id, {
      isSeparateManagement: false,
      separateReason: undefined,
    });
  };

  const setStageRecord = (applicant: Applicant, stage: Stage, statusId: string, meta?: StageRecord['meta']) => {
    const now = new Date().toISOString();
    updateApplicant(applicant.id, {
      stageRecords: applicant.stageRecords.map(r =>
        r.stageId === stage.id ? { stageId: stage.id, statusId, meta, updatedAt: now } : r
      ),
    });
  };

  const handleStatusChange = (applicant: Applicant, stage: Stage, statusId: string) => {
    const isFinal = stage.statuses[stage.statuses.length - 1]?.id === statusId;
    if (stage.completionForm !== 'none' && isFinal) {
      setCompletionModal({ applicantId: applicant.id, stage, statusId });
      return;
    }
    setStageRecord(applicant, stage, statusId);
  };

  const handleCompletionSubmit = (data: { startDate: string; endDate: string; time?: string; interviewer?: string }) => {
    if (!completionModal) return;
    const applicant = applicants.find(a => a.id === completionModal.applicantId);
    if (!applicant) return;
    setStageRecord(applicant, completionModal.stage, completionModal.statusId, {
      startDate: data.startDate,
      endDate: data.endDate,
      time: data.time,
      interviewer: data.interviewer,
    });
  };

  const extraCols = jobPosting ? sortedStages.length : 1;
  const baseCols = 10 + (showSeparateActions ? 1 : 0) + 2;

  return (
    <>
      <div className="overflow-x-auto">
        <table className={`admin-table w-full ${jobPosting ? 'min-w-[1600px]' : 'min-w-[1200px]'}`}>
          <thead>
            <tr>
              <th className="w-12">No</th>
              <th className="w-16">팀</th>
              <th className="w-20">이름</th>
              <th className="w-24">지원일</th>
              <th className="w-20">플랫폼</th>
              <th className="w-16">출생</th>
              <th className="w-32">휴대전화</th>
              <th className="w-24">지역</th>
              <th className="w-20">학교</th>
              <th className="w-16">경력</th>
              {jobPosting
                ? sortedStages.map(stage => (
                    <th key={stage.id} className="w-16 text-center">{stage.name}</th>
                  ))
                : <th className="w-32">현재 단계</th>
              }
              {showSeparateActions && <th className="w-20">사유</th>}
              <th className="w-16">메모</th>
              <th className="w-20">관리</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 && (
              <tr>
                <td colSpan={baseCols + extraCols} className="text-center py-8 text-muted-foreground">
                  등록된 지원자가 없습니다.
                </td>
              </tr>
            )}
            {applicants.map(applicant => {
              const posting = jobPosting ?? postingsById.get(applicant.jobPostingId);
              const currentStage = posting && getCurrentStage(applicant.stageRecords, posting.stages);
              const currentStatus = currentStage && getStageRecordStatus(applicant.stageRecords, currentStage);

              return (
                <tr key={applicant.id}>
                  <td className="text-center text-muted-foreground">{applicant.no}</td>
                  <td>{applicant.team}</td>
                  <td>
                    <button
                      className="text-primary hover:underline font-medium"
                      onClick={() => navigate(`/applicants/${applicant.id}`)}
                    >
                      {applicant.name}
                    </button>
                  </td>
                  <td className="text-xs">{applicant.applicationDate}</td>
                  <td className="text-xs">{applicant.platform}</td>
                  <td className="text-xs">{applicant.birthYear}</td>
                  <td className="text-xs">{applicant.phone}</td>
                  <td>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs cursor-help border-b border-dashed border-muted-foreground">
                          {applicant.region} {applicant.regionDetail}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-medium">면접비 지원 기준</p>
                        <p className="text-xs">{REGION_INTERVIEW_FEE[applicant.region] || '정보 없음'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="text-xs">{applicant.educations[0]?.schoolName ?? '-'}</td>
                  <td className="text-xs">
                    {applicant.careers.length > 0
                      ? `${applicant.careers[applicant.careers.length - 1].company} · ${applicant.careers[applicant.careers.length - 1].role}`
                      : '신입'}
                  </td>
                  {jobPosting ? (
                    sortedStages.map(stage => (
                      <td key={stage.id} className="text-center">
                        <StageSelect
                          stage={stage}
                          stageRecords={applicant.stageRecords}
                          onChange={statusId => handleStatusChange(applicant, stage, statusId)}
                        />
                      </td>
                    ))
                  ) : (
                    <td className="text-xs">
                      {currentStage && currentStatus ? (
                        <span className={`px-2 py-0.5 rounded font-medium whitespace-nowrap ${getStageColorClass(currentStatus.color)}`}>
                          {currentStage.name} · {currentStatus.name}
                        </span>
                      ) : '-'}
                    </td>
                  )}
                  {showSeparateActions && (
                    <td className="text-xs text-muted-foreground">{applicant.separateReason}</td>
                  )}
                  <td>
                    {applicant.memo && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs whitespace-pre-wrap">{applicant.memo}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditModal(applicant)}>
                          <Pencil className="w-3.5 h-3.5 mr-2" /> 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteApplicant(applicant.id)} className="text-destructive">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> 삭제
                        </DropdownMenuItem>
                        {!showSeparateActions ? (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>별도 관리</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {SEPARATE_REASONS.map(reason => (
                                <DropdownMenuItem key={reason} onClick={() => handleSeparateManagement(applicant, reason)}>
                                  {reason}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ) : (
                          <DropdownMenuItem onClick={() => handleRestoreApplicant(applicant)}>
                            목록으로 복원
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {completionModal && (
        <CompletionDateModal
          open={!!completionModal}
          onClose={() => setCompletionModal(null)}
          stepLabel={completionModal.stage.name}
          isInterview={completionModal.stage.completionForm === 'interview'}
          onSubmit={handleCompletionSubmit}
        />
      )}

      {editModal && (
        <ApplicantFormModal
          open={!!editModal}
          onClose={() => setEditModal(null)}
          editData={editModal}
        />
      )}
    </>
  );
}
