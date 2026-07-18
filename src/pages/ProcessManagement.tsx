import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobPostings } from '@/context/JobPostingContext';
import { useApplicants } from '@/context/ApplicantContext';
import { useProcessPreset } from '@/context/ProcessPresetContext';
import JobPostingDetailLink from '@/components/applicant/JobPostingDetailLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
import { Stage, StageStatus, AutoSendConfig, getStageColorHex, progressStatuses } from '@/types/jobPosting';
import { getCurrentStage } from '@/types/applicant';
import StatusBadge from '@/components/common/StatusBadge';
import { Plus, Trash2, GripVertical, Settings2, AlertTriangle, Info } from 'lucide-react';
import StageStatusModal from '@/components/process/StageStatusModal';
import AutoSendPanel from '@/components/process/AutoSendPanel';

const PRESET_ID = '__preset__';

export default function ProcessManagementPage() {
  const { jobPostings, updateJobPosting } = useJobPostings();
  const { applicants, updateApplicant } = useApplicants();
  const { presetStages, setPresetStages } = useProcessPreset();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedIdState] = useState(() => searchParams.get('posting') || PRESET_ID);

  const setSelectedId = (id: string) => {
    setSelectedIdState(id);
    setSearchParams(sp => {
      const next = new URLSearchParams(sp);
      next.set('posting', id);
      return next;
    }, { replace: true });
  };
  const [statusModalStage, setStatusModalStage] = useState<Stage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Stage | null>(null);
  const [showNewStage, setShowNewStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  /** dragstart의 event.target은 실제 마우스가 눌린 하위 요소가 아니라 항상
   * draggable이 걸린 카드 자신이므로, "핸들에서 시작했는지"는 핸들의 mousedown을
   * 별도로 추적해 판단한다(StageStatusModal과 동일한 패턴, 2026-07-17 결정). */
  const isHandleMouseDownRef = useRef(false);
  /** dragover/drop은 dragstart 직후 아주 빠르게 연달아 발생할 수 있어, setState로만
   * 관리하면 아직 리렌더가 커밋되기 전이라 dragover/drop 핸들러가 오래된(null)
   * draggingIndex를 참조해 preventDefault를 놓치는 경우가 있었다(실제로 겪은 문제).
   * ref는 setState와 별개로 즉시 갱신되므로 dragover/drop 판단은 항상 이 ref를 쓴다. */
  const draggingIndexRef = useRef<number | null>(null);

  const isPreset = selectedId === PRESET_ID;
  const posting = isPreset ? undefined : jobPostings.find(j => j.id === selectedId);
  const jobApplicants = posting ? applicants.filter(a => a.jobPostingId === posting.id) : [];

  const sortedStages = isPreset
    ? [...presetStages].sort((a, b) => a.order - b.order)
    : posting ? [...posting.stages].sort((a, b) => a.order - b.order) : [];

  const persistStages = (stages: Stage[]) => {
    if (isPreset) setPresetStages(stages);
    else if (posting) updateJobPosting(posting.id, { stages });
  };

  /** from 위치의 단계를 to 위치로 옮긴다(react-beautiful-dnd의 표준 reorder 구현과 동일). */
  const reorderStage = (from: number, to: number) => {
    const next = [...sortedStages];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    persistStages(next.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const renameStage = (stageId: string, name: string) => {
    persistStages(sortedStages.map(s => s.id === stageId ? { ...s, name } : s));
  };

  const saveStatuses = (stageId: string, statuses: StageStatus[]) => {
    persistStages(sortedStages.map(s => s.id === stageId ? { ...s, statuses } : s));
  };

  /** 상태값 삭제 확정 시 호출된다. 그 상태였던 지원자를 새 시작 상태로 옮긴 뒤(잠금
   * 여부와 무관하게 전원 대상 — 잠금은 사용자 조작을 막는 것이지 시스템이 대신
   * 처리하는 이동까지 막지는 않는다), 상태 목록을 즉시 저장한다. */
  const handleDeleteStatus = (stageId: string, deletedStatusId: string, nextStatuses: StageStatus[]) => {
    const newDefaultStatus = nextStatuses[0];
    if (newDefaultStatus) {
      jobApplicants.forEach(a => {
        const record = a.stageRecords.find(r => r.stageId === stageId);
        if (!record || record.statusId !== deletedStatusId) return;
        const now = new Date().toISOString();
        const nextRecords = a.stageRecords.map(r =>
          r.stageId === stageId ? { ...r, statusId: newDefaultStatus.id, updatedAt: now } : r
        );
        updateApplicant(a.id, { stageRecords: nextRecords });
      });
    }
    saveStatuses(stageId, nextStatuses);
  };

  const saveAutoSend = (stageId: string, autoSend: AutoSendConfig) => {
    persistStages(sortedStages.map(s => s.id === stageId ? { ...s, autoSend } : s));
  };

  const deleteTargetIndex = deleteTarget ? sortedStages.findIndex(s => s.id === deleteTarget.id) : -1;
  const deleteTargetIsFirst = deleteTargetIndex === 0;
  const deleteDestStage = deleteTarget && deleteTargetIndex >= 0
    ? (deleteTargetIsFirst ? sortedStages[deleteTargetIndex + 1] : sortedStages[deleteTargetIndex - 1])
    : undefined;
  const deleteImpactCount = deleteTarget && posting
    ? jobApplicants.filter(a => getCurrentStage(a.stageRecords, sortedStages)?.id === deleteTarget.id).length
    : 0;

  /** 단계 삭제 확정: 그 단계가 현재 위치였던 지원자를(잠금 여부와 무관하게) 이웃
   * 단계로 옮기고(뒤로 = 이전 단계의 마지막 상태, 앞으로 = 다음 단계의 시작 상태),
   * 이 단계에서 입력했던 날짜/메모 기록은 이동 여부와 관계없이 함께 지운다.
   * 프리셋 편집 중에는 지원자 개념이 없으므로 이동 로직 없이 단계만 제거한다. */
  const confirmDeleteStage = () => {
    if (!deleteTarget) return;

    if (posting && deleteDestStage) {
      const destStatus = deleteTargetIsFirst
        ? (deleteDestStage.statuses.find(s => s.isDefault) ?? deleteDestStage.statuses[0])
        : deleteDestStage.statuses[deleteDestStage.statuses.length - 1];
      const now = new Date().toISOString();

      jobApplicants.forEach(a => {
        const hasRecord = a.stageRecords.some(r => r.stageId === deleteTarget.id);
        if (!hasRecord) return;
        const wasCurrent = getCurrentStage(a.stageRecords, sortedStages)?.id === deleteTarget.id;
        let nextRecords = a.stageRecords.filter(r => r.stageId !== deleteTarget.id);
        if (wasCurrent && destStatus) {
          const exists = nextRecords.some(r => r.stageId === deleteDestStage.id);
          nextRecords = exists
            ? nextRecords.map(r => r.stageId === deleteDestStage.id ? { ...r, statusId: destStatus.id, updatedAt: now } : r)
            : [...nextRecords, { stageId: deleteDestStage.id, statusId: destStatus.id, updatedAt: now }];
        }
        updateApplicant(a.id, { stageRecords: nextRecords });
      });
    }

    persistStages(sortedStages.filter(s => s.id !== deleteTarget.id).map((s, i) => ({ ...s, order: i + 1 })));
    setDeleteTarget(null);
  };

  const addStage = () => {
    if (!newStageName.trim() || !(posting || isPreset)) return;
    const newStage: Stage = {
      id: crypto.randomUUID(),
      name: newStageName.trim(),
      order: sortedStages.length + 1,
      statuses: progressStatuses(),
    };
    persistStages([...sortedStages, newStage]);
    setNewStageName('');
    setShowNewStage(false);
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">프로세스 관리</h2>
        <p className="text-sm text-muted-foreground">공고별 전형 단계와 발송 메시지 설정을 관리합니다.</p>
      </div>

      <div className="mb-5 flex items-center gap-3 max-w-md">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={PRESET_ID}>기본 프리셋</SelectItem>
            {jobPostings.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
          </SelectContent>
        </Select>
        {posting && <JobPostingDetailLink jobPostingId={posting.id} className="shrink-0" />}
      </div>

      {isPreset && (
        <div className="card-soft px-3 py-2 mb-5 flex items-start gap-2 text-xs text-muted-foreground max-w-2xl">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>
            새 공고에 기본 적용되는 프로세스입니다. 여기서 수정해도 이미 등록된 공고에는 소급 적용되지 않으며(공고 생성 시점에 복사됨),
            새로고침하면 초기값으로 리셋됩니다(프로토타입 한계).
          </p>
        </div>
      )}

      {(posting || isPreset) && (
        <div className="space-y-3">
          {sortedStages.map((stage, i) => {
            const showDropLineAbove = dragOverIndex === i && draggingIndex !== null && draggingIndex > i;
            const showDropLineBelow = dragOverIndex === i && draggingIndex !== null && draggingIndex < i;
            return (
            <div
              key={stage.id}
              draggable
              onDragStart={e => {
                const startedFromHandle = isHandleMouseDownRef.current;
                isHandleMouseDownRef.current = false;
                if (!startedFromHandle) {
                  e.preventDefault();
                  return;
                }
                e.dataTransfer.effectAllowed = 'move';
                draggingIndexRef.current = i;
                setDraggingIndex(i);
              }}
              onDragEnd={() => {
                isHandleMouseDownRef.current = false;
                draggingIndexRef.current = null;
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
              onDragOver={e => {
                if (draggingIndexRef.current === null) return;
                e.preventDefault();
                if (draggingIndexRef.current !== i) setDragOverIndex(i);
              }}
              onDrop={e => {
                e.preventDefault();
                const from = draggingIndexRef.current;
                if (from !== null && from !== i) reorderStage(from, i);
                draggingIndexRef.current = null;
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
              className={`card-elevated relative transition-opacity ${draggingIndex === i ? 'opacity-40' : ''}`}
            >
              {showDropLineAbove && <div className="absolute -top-1.5 inset-x-4 h-0.5 rounded-full bg-primary z-10" />}
              {showDropLineBelow && <div className="absolute -bottom-1.5 inset-x-4 h-0.5 rounded-full bg-primary z-10" />}
              <div className="flex items-center gap-3 p-4">
                <div
                  onMouseDown={() => { isHandleMouseDownRef.current = true; }}
                  onMouseUp={() => { isHandleMouseDownRef.current = false; }}
                  className="flex items-center justify-center px-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
                <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
                <Input
                  className="max-w-xs h-9"
                  value={stage.name}
                  onChange={e => renameStage(stage.id, e.target.value)}
                />
                <div className="flex items-center gap-1 flex-wrap">
                  {stage.statuses.map(status => (
                    <StatusBadge key={status.id} color={getStageColorHex(status.color)} className="text-[11px] px-1.5 py-0.5">
                      {status.name}
                      {status.isDefault ? ' (시작)' : ''}
                      {status.isCompletion ? ' (단계종료)' : ''}
                    </StatusBadge>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setStatusModalStage(stage)}>
                    <Settings2 className="w-3.5 h-3.5 mr-1" /> 상태 관리
                  </Button>
                  {sortedStages.length <= 1 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground/40 cursor-not-allowed p-2">
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>최소 1개의 단계가 필요합니다</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(stage)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem value="autoSend" className="border-t border-b-0">
                  <AccordionTrigger className="px-4 py-2 text-xs text-muted-foreground hover:no-underline">
                    발송 메시지 설정{stage.autoSend?.enabled ? ' (자동 발송 사용 중)' : ''}
                  </AccordionTrigger>
                  <AccordionContent>
                    <AutoSendPanel config={stage.autoSend} onSave={config => saveAutoSend(stage.id, config)} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            );
          })}

          {showNewStage ? (
            <div className="card-elevated p-4 flex items-center gap-2">
              <Input
                className="max-w-xs h-9"
                value={newStageName}
                onChange={e => setNewStageName(e.target.value)}
                placeholder="새 단계 이름"
                autoFocus
              />
              <Button size="sm" onClick={addStage}>추가</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewStage(false)}>취소</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowNewStage(true)}>
              <Plus className="w-4 h-4 mr-1" /> 단계 추가
            </Button>
          )}
        </div>
      )}

      {!posting && !isPreset && (
        <p className="text-sm text-muted-foreground">선택한 공고를 찾을 수 없습니다. 다른 공고를 선택해주세요.</p>
      )}

      {statusModalStage && (
        <StageStatusModal
          open={!!statusModalStage}
          onClose={() => setStatusModalStage(null)}
          stage={statusModalStage}
          applicants={jobApplicants}
          onSave={statuses => saveStatuses(statusModalStage.id, statuses)}
          onDeleteStatus={(deletedStatusId, nextStatuses) => handleDeleteStatus(statusModalStage.id, deletedStatusId, nextStatuses)}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> 단계를 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" 단계를 삭제합니다.
              {isPreset && <> 이후 생성되는 공고부터 적용됩니다.</>}
              {!isPreset && deleteImpactCount > 0 && deleteDestStage && (
                <>
                  {' '}이 단계에는 지원자 {deleteImpactCount}명이 있으며, 해당 지원자는{' '}
                  {deleteTargetIsFirst
                    ? <>다음 단계 "{deleteDestStage.name}"의 시작 상태로 이동됩니다.</>
                    : <>이전 단계 "{deleteDestStage.name}"의 마지막 상태로 이동됩니다.</>}
                  {' '}이 단계에서 입력한 날짜/메모 기록도 함께 삭제됩니다.
                </>
              )}
              {' '}이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDeleteStage}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
