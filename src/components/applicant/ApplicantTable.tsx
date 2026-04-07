import React, { useState, useRef } from 'react';
import { Applicant, RecruitmentStatus, StepDetail, STEP_LABELS, REGION_INTERVIEW_FEE, SEPARATE_REASONS, SeparateManagementReason } from '@/types/applicant';
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

function StatusBadge({ detail, stepKey, onClick }: { detail: StepDetail; stepKey: StepKey; onClick: () => void }) {
  const isResult = RESULT_STEPS.includes(stepKey);

  const getLabel = () => {
    if (detail.status === 'pending') return '-';
    if (detail.status === 'need') return '필요';
    if (detail.status === 'done') return '완료';
    if (detail.status === 'pass') return '합격';
    if (detail.status === 'fail') return '불합격';
    return '-';
  };

  const getClass = () => {
    if (detail.status === 'pending') return 'status-badge status-pending';
    if (detail.status === 'need') return 'status-badge status-need';
    if (detail.status === 'done') return 'status-badge status-done';
    if (detail.status === 'pass') return 'status-badge status-pass';
    if (detail.status === 'fail') return 'status-badge status-fail';
    return 'status-badge status-pending';
  };

  const hasDateInfo = detail.startDate || detail.endDate || detail.interviewer;

  const badge = (
    <span className={getClass()} onClick={onClick}>
      {getLabel()}
    </span>
  );

  if (hasDateInfo) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
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

  return badge;
}

export default function ApplicantTable({ applicants, showSeparateActions }: Props) {
  const { updateApplicant, deleteApplicant } = useApplicants();
  const [completionModal, setCompletionModal] = useState<{ applicantId: string; stepKey: StepKey; isEdit?: boolean } | null>(null);
  const [detailModal, setDetailModal] = useState<Applicant | null>(null);
  const [editModal, setEditModal] = useState<Applicant | null>(null);

  const handleStatusClick = (applicant: Applicant, stepKey: StepKey) => {
    const detail = applicant.recruitmentStatus[stepKey];
    const isResult = RESULT_STEPS.includes(stepKey);
    const needsDate = STEPS_NEEDING_DATE.includes(stepKey);

    if (isResult) {
      // Toggle between pending -> pass -> fail
      const nextStatus = detail.status === 'pending' ? 'pass' : detail.status === 'pass' ? 'fail' : 'pending';
      updateApplicant(applicant.id, {
        recruitmentStatus: {
          ...applicant.recruitmentStatus,
          [stepKey]: { ...detail, status: nextStatus },
        },
      });
    } else if (needsDate) {
      // need -> done (with date modal)
      if (detail.status === 'pending') {
        updateApplicant(applicant.id, {
          recruitmentStatus: {
            ...applicant.recruitmentStatus,
            [stepKey]: { ...detail, status: 'need' },
          },
        });
      } else if (detail.status === 'need') {
        setCompletionModal({ applicantId: applicant.id, stepKey });
      } else if (detail.status === 'done') {
        setCompletionModal({ applicantId: applicant.id, stepKey, isEdit: true });
      }
    } else {
      // Simple toggle: pending -> need -> done
      const nextStatus = detail.status === 'pending' ? 'need' : detail.status === 'need' ? 'done' : 'pending';
      updateApplicant(applicant.id, {
        recruitmentStatus: {
          ...applicant.recruitmentStatus,
          [stepKey]: { ...detail, status: nextStatus },
        },
      });
    }
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
        <table className="admin-table w-full min-w-[1400px]">
          <thead>
            <tr>
              <th className="w-12">No</th>
              <th className="w-16">팀</th>
              <th className="w-20">이름</th>
              <th className="w-20">플랫폼</th>
              <th className="w-16">출생</th>
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
                <td colSpan={STEP_KEYS.length + (showSeparateActions ? 10 : 9)} className="text-center py-8 text-muted-foreground">
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
                <td className="text-xs">{applicant.platform}</td>
                <td className="text-xs">{applicant.birthYear}</td>
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
                    <StatusBadge
                      detail={applicant.recruitmentStatus[key]}
                      stepKey={key}
                      onClick={() => handleStatusClick(applicant, key)}
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
