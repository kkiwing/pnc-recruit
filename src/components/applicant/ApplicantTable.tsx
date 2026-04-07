import React, { useState } from 'react';
import { Applicant, RecruitmentStatus, StepDetail, STEP_LABELS, REGION_INTERVIEW_FEE, SEPARATE_REASONS, SeparateManagementReason, StepStatus } from '@/types/applicant';
import { useApplicants } from '@/context/ApplicantContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MoreHorizontal, MessageSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import CompletionDateModal from './CompletionDateModal';
import ApplicantDetailModal from './ApplicantDetailModal';
import ApplicantFormModal from './ApplicantFormModal';

interface Props {
  applicants: Applicant[];
  showSeparateActions?: boolean;
}

type StepKey = keyof RecruitmentStatus;

const STEP_KEYS: StepKey[] = [
  'personalityTestNotice',
  'personalityTestRegistration',
  'personalityTestResult',
  'companyFormNotice',
  'companyFormSubmission',
  'interviewNotice',
  'interviewResult',
];

const STEPS_NEEDING_DATE: StepKey[] = ['personalityTestNotice', 'companyFormNotice', 'interviewNotice'];
const RESULT_STEPS: StepKey[] = ['personalityTestResult', 'interviewResult'];

const NORMAL_OPTIONS: { value: StepStatus; label: string }[] = [
  { value: 'pending', label: '대기' },
  { value: 'need', label: '필요' },
  { value: 'done', label: '완료' },
];

const RESULT_OPTIONS: { value: StepStatus; label: string }[] = [
  { value: 'pending', label: '대기' },
  { value: 'pass', label: '합격' },
  { value: 'fail', label: '불합격' },
];

function getSelectClass(status: StepStatus) {
  switch (status) {
    case 'pending': return 'bg-muted text-muted-foreground';
    case 'need': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'done': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'pass': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'fail': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-muted text-muted-foreground';
  }
}

function StatusSelect({ detail, stepKey, onChange }: { detail: StepDetail; stepKey: StepKey; onChange: (status: StepStatus) => void }) {
  const isResult = RESULT_STEPS.includes(stepKey);
  const options = isResult ? RESULT_OPTIONS : NORMAL_OPTIONS;
  const hasDateInfo = detail.startDate || detail.endDate || detail.interviewer;

  const select = (
    <select
      className={`text-xs rounded px-1.5 py-1 border-0 cursor-pointer font-medium text-center appearance-none ${getSelectClass(detail.status)}`}
      value={detail.status}
      onChange={e => onChange(e.target.value as StepStatus)}
      style={{ minWidth: '52px' }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  if (hasDateInfo) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{select}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs space-y-1 max-w-xs">
          {detail.startDate && detail.endDate && (
            <p>기간: {detail.startDate} ~ {detail.endDate}</p>
          )}
          {detail.time && <p>시간: {detail.time}</p>}
          {detail.interviewer && <p>담당자: {detail.interviewer}</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return select;
}

export default function ApplicantTable({ applicants, showSeparateActions }: Props) {
  const { updateApplicant, deleteApplicant } = useApplicants();
  const [completionModal, setCompletionModal] = useState<{ applicantId: string; stepKey: StepKey; isEdit?: boolean } | null>(null);
  const [detailModal, setDetailModal] = useState<Applicant | null>(null);
  const [editModal, setEditModal] = useState<Applicant | null>(null);

  const handleStatusChange = (applicant: Applicant, stepKey: StepKey, newStatus: StepStatus) => {
    const detail = applicant.recruitmentStatus[stepKey];
    const needsDate = STEPS_NEEDING_DATE.includes(stepKey);

    if (needsDate && newStatus === 'done') {
      // Open date modal when changing to 'done' for date-required steps
      setCompletionModal({ applicantId: applicant.id, stepKey });
      return;
    }

    if (needsDate && detail.status === 'done' && newStatus !== 'done') {
      // Clear date info when moving away from done
      updateApplicant(applicant.id, {
        recruitmentStatus: {
          ...applicant.recruitmentStatus,
          [stepKey]: { status: newStatus },
        },
      });
      return;
    }

    updateApplicant(applicant.id, {
      recruitmentStatus: {
        ...applicant.recruitmentStatus,
        [stepKey]: { ...detail, status: newStatus },
      },
    });
  };

  const handleCompletionSubmit = (data: { startDate: string; endDate: string; time?: string; interviewer?: string }) => {
    if (!completionModal) return;
    const applicant = applicants.find(a => a.id === completionModal.applicantId);
    if (!applicant) return;
    updateApplicant(applicant.id, {
      recruitmentStatus: {
        ...applicant.recruitmentStatus,
        [completionModal.stepKey]: {
          status: 'done',
          startDate: data.startDate,
          endDate: data.endDate,
          time: data.time,
          interviewer: data.interviewer,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  };

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

  const currentCompletionApplicant = completionModal ? applicants.find(a => a.id === completionModal.applicantId) : null;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="admin-table w-full min-w-[1600px]">
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
              {STEP_KEYS.map(key => (
                <th key={key} className="w-16 text-center">{STEP_LABELS[key].replace('인성검사 ', '인성\n').replace('자사양식 ', '자사\n').replace('면접 ', '면접\n')}</th>
              ))}
              {showSeparateActions && <th className="w-20">사유</th>}
              <th className="w-16">메모</th>
              <th className="w-20">관리</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 && (
              <tr>
                <td colSpan={STEP_KEYS.length + (showSeparateActions ? 12 : 11)} className="text-center py-8 text-muted-foreground">
                  등록된 지원자가 없습니다.
                </td>
              </tr>
            )}
            {applicants.map(applicant => (
              <tr key={applicant.id}>
                <td className="text-center text-muted-foreground">{applicant.no}</td>
                <td>{applicant.team}</td>
                <td>
                  <button
                    className="text-primary hover:underline font-medium"
                    onClick={() => setDetailModal(applicant)}
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
                <td className="text-xs">{applicant.school}</td>
                <td className="text-xs">{applicant.career}</td>
                {STEP_KEYS.map(key => (
                  <td key={key} className="text-center">
                    <StatusSelect
                      detail={applicant.recruitmentStatus[key]}
                      stepKey={key}
                      onChange={(status) => handleStatusChange(applicant, key, status)}
                    />
                  </td>
                ))}
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
            ))}
          </tbody>
        </table>
      </div>

      {completionModal && currentCompletionApplicant && (
        <CompletionDateModal
          open={!!completionModal}
          onClose={() => setCompletionModal(null)}
          stepLabel={STEP_LABELS[completionModal.stepKey]}
          isInterview={completionModal.stepKey === 'interviewNotice'}
          initialData={completionModal.isEdit ? currentCompletionApplicant.recruitmentStatus[completionModal.stepKey] : undefined}
          onSubmit={handleCompletionSubmit}
        />
      )}

      {detailModal && (
        <ApplicantDetailModal
          open={!!detailModal}
          onClose={() => setDetailModal(null)}
          applicant={detailModal}
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
