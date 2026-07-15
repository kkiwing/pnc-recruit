import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Applicant, SEPARATE_REASONS, StageRecord, getCurrentStage, getSeparationStage, getStageRecordStatus } from '@/types/applicant';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import { Stage, getStageColorHex } from '@/types/jobPosting';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, MoreHorizontal, MessageSquare, Clock, Eye, Undo2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import CompletionDateModal from './CompletionDateModal';
import MemoModal from './MemoModal';
import FinalResultModal from './FinalResultModal';
import SharedStatusSelect from '@/components/common/StatusSelect';
import StatusBadge from '@/components/common/StatusBadge';

interface Props {
  applicants: Applicant[];
  /** 'active'(기본): 전형/상태를 직접 편집하는 지원자 목록. 'separate': 별도관리 사유/당시 단계를 보여주는 읽기 전용 목록. */
  mode?: 'active' | 'separate';
}

function StatusSelect({ stage, stageRecords, onChange, onEditMeta }: {
  stage: Stage;
  stageRecords: StageRecord[];
  onChange: (statusId: string) => void;
  onEditMeta: () => void;
}) {
  const status = getStageRecordStatus(stageRecords, stage);
  const record = stageRecords.find(r => r.stageId === stage.id);
  const meta = record?.meta;
  const hasMetaInfo = !!meta && !!(meta.startDate || meta.time || meta.note);

  return (
    <div className="inline-flex items-center gap-1.5">
      <SharedStatusSelect
        value={status?.id ?? ''}
        options={stage.statuses.map(s => ({ id: s.id, name: s.name, color: getStageColorHex(s.color) }))}
        onChange={onChange}
      />
      {status?.hasDateInput && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={onEditMeta}>
              <Clock className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs space-y-1 max-w-xs">
            {hasMetaInfo ? (
              <>
                {meta?.startDate && meta?.endDate && <p>기간: {meta.startDate} ~ {meta.endDate}</p>}
                {meta?.time && <p>시간: {meta.time}</p>}
                {meta?.note && <p>메모: {meta.note}</p>}
                <p className="text-muted-foreground">클릭해서 수정</p>
              </>
            ) : (
              <p>클릭해서 날짜·시간·메모 입력</p>
            )}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export default function ApplicantOverviewTable({ applicants, mode = 'active' }: Props) {
  const { updateApplicant, deleteApplicant } = useApplicants();
  const { jobPostings } = useJobPostings();
  const navigate = useNavigate();
  const [activeStageByApplicant, setActiveStageByApplicant] = useState<Record<string, string>>({});
  const [completionModal, setCompletionModal] = useState<{ applicantId: string; stage: Stage; statusId: string; initialData?: StageRecord['meta'] } | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Applicant | null>(null);
  const [memoTarget, setMemoTarget] = useState<Applicant | null>(null);
  const [finalResultTarget, setFinalResultTarget] = useState<Applicant | null>(null);

  const postingsById = new Map(jobPostings.map(j => [j.id, j]));

  const handleSaveMemo = (memo: string) => {
    if (!memoTarget) return;
    updateApplicant(memoTarget.id, { memo });
  };

  const handleSaveFinalResult = (finalResult: Applicant['finalResult']) => {
    if (!finalResultTarget) return;
    updateApplicant(finalResultTarget.id, { finalResult });
  };

  const getActiveStage = (applicant: Applicant, sortedStages: Stage[]): Stage | undefined => {
    const chosenId = activeStageByApplicant[applicant.id];
    const chosen = chosenId && sortedStages.find(s => s.id === chosenId);
    if (chosen) return chosen;
    return getCurrentStage(applicant.stageRecords, sortedStages) ?? sortedStages[0];
  };

  const handleSeparateManagement = (applicant: Applicant, reason: typeof SEPARATE_REASONS[number]) => {
    const posting = postingsById.get(applicant.jobPostingId);
    const sortedStages = posting ? [...posting.stages].sort((a, b) => a.order - b.order) : [];
    const currentStage = getCurrentStage(applicant.stageRecords, sortedStages);
    updateApplicant(applicant.id, {
      isSeparateManagement: true,
      separateReason: reason,
      separateStageId: currentStage?.id,
    });
  };

  const handleRestoreApplicant = (applicant: Applicant) => {
    updateApplicant(applicant.id, {
      isSeparateManagement: false,
      separateReason: undefined,
      separateStageId: undefined,
    });
    setRestoreTarget(null);
  };

  const setStageRecord = (applicant: Applicant, stage: Stage, statusId: string, meta?: StageRecord['meta']) => {
    const now = new Date().toISOString();
    const exists = applicant.stageRecords.some(r => r.stageId === stage.id);
    const nextRecords = exists
      ? applicant.stageRecords.map(r => r.stageId === stage.id ? { stageId: stage.id, statusId, meta, updatedAt: now } : r)
      : [...applicant.stageRecords, { stageId: stage.id, statusId, meta, updatedAt: now }];
    updateApplicant(applicant.id, { stageRecords: nextRecords });
  };

  const handleStatusChange = (applicant: Applicant, stage: Stage, statusId: string) => {
    const targetStatus = stage.statuses.find(s => s.id === statusId);
    if (targetStatus?.hasDateInput) {
      setCompletionModal({ applicantId: applicant.id, stage, statusId });
      return;
    }
    setStageRecord(applicant, stage, statusId);
  };

  const handleEditMeta = (applicant: Applicant, stage: Stage) => {
    const status = getStageRecordStatus(applicant.stageRecords, stage);
    const record = applicant.stageRecords.find(r => r.stageId === stage.id);
    if (!status) return;
    setCompletionModal({ applicantId: applicant.id, stage, statusId: status.id, initialData: record?.meta });
  };

  const handleCompletionSubmit = (data: { startDate: string; endDate: string; time?: string; note?: string }) => {
    if (!completionModal) return;
    const applicant = applicants.find(a => a.id === completionModal.applicantId);
    if (!applicant) return;
    setStageRecord(applicant, completionModal.stage, completionModal.statusId, {
      startDate: data.startDate,
      endDate: data.endDate,
      time: data.time,
      note: data.note,
    });
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>지원자</th>
              <th>공고</th>
              {mode === 'active' ? (
                <>
                  <th className="w-40">전형</th>
                  <th className="w-32">상태</th>
                </>
              ) : (
                <>
                  <th className="w-40">별도관리 사유</th>
                  <th className="w-48">당시 진행 단계</th>
                </>
              )}
              <th className="w-20 whitespace-nowrap">최종 결과</th>
              <th className="w-28">지원일</th>
              <th className="w-12 whitespace-nowrap">메모</th>
              <th className="w-16 whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  등록된 지원자가 없습니다.
                </td>
              </tr>
            )}
            {applicants.map(applicant => {
              const posting = postingsById.get(applicant.jobPostingId);
              const sortedStages = posting ? [...posting.stages].sort((a, b) => a.order - b.order) : [];
              const activeStage = posting ? getActiveStage(applicant, sortedStages) : undefined;
              const separationStage = mode === 'separate' ? getSeparationStage(applicant, sortedStages) : undefined;
              const separationStatus = separationStage ? getStageRecordStatus(applicant.stageRecords, separationStage) : undefined;

              return (
                <tr key={applicant.id}>
                  <td>
                    <div className="flex flex-col">
                      <button
                        className="text-primary hover:underline font-medium text-left"
                        onClick={() => navigate(`/applicants/${applicant.id}`)}
                      >
                        {applicant.name}
                      </button>
                      <span className="text-xs text-muted-foreground">{applicant.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span>{posting?.title ?? '-'}</span>
                      <span className="text-xs text-muted-foreground">{applicant.team}</span>
                    </div>
                  </td>
                  {mode === 'active' ? (
                    <>
                      <td>
                        {posting && activeStage ? (
                          <Select
                            value={activeStage.id}
                            onValueChange={v => setActiveStageByApplicant(prev => ({ ...prev, [applicant.id]: v }))}
                          >
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {sortedStages.map(stage => (
                                <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : '-'}
                      </td>
                      <td>
                        {activeStage ? (
                          <StatusSelect
                            stage={activeStage}
                            stageRecords={applicant.stageRecords}
                            onChange={statusId => handleStatusChange(applicant, activeStage, statusId)}
                            onEditMeta={() => handleEditMeta(applicant, activeStage)}
                          />
                        ) : '-'}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {applicant.separateReason ? (
                          <Badge variant="outline" className="text-xs whitespace-nowrap">{applicant.separateReason}</Badge>
                        ) : '-'}
                      </td>
                      <td>
                        {separationStage && separationStatus ? (
                          <StatusBadge color={getStageColorHex(separationStatus.color)} className="whitespace-nowrap">
                            {separationStage.name} · {separationStatus.name}
                          </StatusBadge>
                        ) : '-'}
                      </td>
                    </>
                  )}
                  <td className="whitespace-nowrap">
                    {applicant.finalResult ? (
                      <div className="inline-flex items-center gap-1">
                        <button type="button" onClick={() => setFinalResultTarget(applicant)}>
                          <Badge variant={applicant.finalResult.result === '합격' ? 'success' : 'destructive'} className="text-xs cursor-pointer">
                            {applicant.finalResult.result}
                          </Badge>
                        </button>
                        {applicant.finalResult.note && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <MessageSquare className="w-3 h-3 text-muted-foreground shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-xs">{applicant.finalResult.note}</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground/50 hover:text-muted-foreground underline"
                        onClick={() => setFinalResultTarget(applicant)}
                      >
                        미정
                      </button>
                    )}
                  </td>
                  <td className="text-xs whitespace-nowrap">{applicant.applicationDate}</td>
                  <td>
                    <button
                      type="button"
                      title="메모 보기/작성"
                      className={`hover:text-foreground ${applicant.memo ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
                      onClick={() => setMemoTarget(applicant)}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/applicants/${applicant.id}`)}>
                          <Eye className="w-3.5 h-3.5 mr-2" /> 상세보기
                        </DropdownMenuItem>
                        {mode === 'active' ? (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>별도 관리 이동</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {SEPARATE_REASONS.map(reason => (
                                <DropdownMenuItem key={reason} onClick={() => handleSeparateManagement(applicant, reason)}>
                                  {reason}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ) : (
                          <DropdownMenuItem onClick={() => setRestoreTarget(applicant)}>
                            <Undo2 className="w-3.5 h-3.5 mr-2" /> 지원자 목록으로 복귀
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => deleteApplicant(applicant.id)} className="text-destructive">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> 삭제
                        </DropdownMenuItem>
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
          initialData={completionModal.initialData}
          onSubmit={handleCompletionSubmit}
        />
      )}

      {memoTarget && (
        <MemoModal
          open={!!memoTarget}
          onClose={() => setMemoTarget(null)}
          applicantId={memoTarget.id}
          applicantName={memoTarget.name}
          memo={memoTarget.memo}
          onSave={handleSaveMemo}
        />
      )}

      {finalResultTarget && (
        <FinalResultModal
          open={!!finalResultTarget}
          onClose={() => setFinalResultTarget(null)}
          applicantName={finalResultTarget.name}
          finalResult={finalResultTarget.finalResult}
          onSave={handleSaveFinalResult}
        />
      )}

      <AlertDialog open={!!restoreTarget} onOpenChange={open => !open && setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>지원자 목록으로 복귀하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{restoreTarget?.name}"님을 별도 관리에서 해제하고 일반 지원자 목록으로 되돌립니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => restoreTarget && handleRestoreApplicant(restoreTarget)}>
              복귀
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
