import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Applicant, REGION_INTERVIEW_FEE, SEPARATE_REASONS, SeparateManagementReason, getCurrentStage, getStageRecordStatus } from '@/types/applicant';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import { getStageColorClass } from '@/types/jobPosting';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MoreHorizontal, MessageSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import ApplicantFormModal from './ApplicantFormModal';

interface Props {
  applicants: Applicant[];
  showSeparateActions?: boolean;
}

export default function ApplicantTable({ applicants, showSeparateActions }: Props) {
  const { updateApplicant, deleteApplicant } = useApplicants();
  const { jobPostings } = useJobPostings();
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState<Applicant | null>(null);

  const postingsById = new Map(jobPostings.map(j => [j.id, j]));

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

  return (
    <>
      <div className="overflow-x-auto">
        <table className="admin-table w-full min-w-[1200px]">
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
              <th className="w-32">현재 단계</th>
              {showSeparateActions && <th className="w-20">사유</th>}
              <th className="w-16">메모</th>
              <th className="w-20">관리</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 && (
              <tr>
                <td colSpan={showSeparateActions ? 13 : 12} className="text-center py-8 text-muted-foreground">
                  등록된 지원자가 없습니다.
                </td>
              </tr>
            )}
            {applicants.map(applicant => {
              const posting = postingsById.get(applicant.jobPostingId);
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
                  <td className="text-xs">
                    {currentStage && currentStatus ? (
                      <span className={`px-2 py-0.5 rounded font-medium whitespace-nowrap ${getStageColorClass(currentStatus.color)}`}>
                        {currentStage.name} · {currentStatus.name}
                      </span>
                    ) : '-'}
                  </td>
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
