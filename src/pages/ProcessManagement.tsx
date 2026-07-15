import React, { useState } from 'react';
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
import { Stage, StageType, StageStatus, AutoSendConfig, getStageColorHex, progressStatuses, resultStatuses } from '@/types/jobPosting';
import StatusBadge from '@/components/common/StatusBadge';
import { Plus, Trash2, ChevronUp, ChevronDown, Settings2, AlertTriangle, Info } from 'lucide-react';
import StageStatusModal from '@/components/process/StageStatusModal';
import AutoSendPanel from '@/components/process/AutoSendPanel';

const STAGE_TYPE_LABELS: Record<StageType, string> = {
  normal: '일반',
  result: '합불 판정',
};

const PRESET_ID = '__preset__';

export default function ProcessManagementPage() {
  const { jobPostings, updateJobPosting } = useJobPostings();
  const { applicants } = useApplicants();
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
  const [newStageType, setNewStageType] = useState<StageType>('normal');

  const isPreset = selectedId === PRESET_ID;
  const posting = isPreset ? undefined : jobPostings.find(j => j.id === selectedId);
  const applicantCount = posting ? applicants.filter(a => a.jobPostingId === posting.id).length : 0;

  const sortedStages = isPreset
    ? [...presetStages].sort((a, b) => a.order - b.order)
    : posting ? [...posting.stages].sort((a, b) => a.order - b.order) : [];

  const persistStages = (stages: Stage[]) => {
    if (isPreset) setPresetStages(stages);
    else if (posting) updateJobPosting(posting.id, { stages });
  };

  const moveStage = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sortedStages.length) return;
    const next = [...sortedStages];
    [next[index], next[target]] = [next[target], next[index]];
    persistStages(next.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const renameStage = (stageId: string, name: string) => {
    persistStages(sortedStages.map(s => s.id === stageId ? { ...s, name } : s));
  };

  const changeStageType = (stageId: string, stageType: StageType) => {
    persistStages(sortedStages.map(s => s.id === stageId ? { ...s, stageType } : s));
  };

  const saveStatuses = (stageId: string, statuses: StageStatus[]) => {
    persistStages(sortedStages.map(s => s.id === stageId ? { ...s, statuses } : s));
  };

  const saveAutoSend = (stageId: string, autoSend: AutoSendConfig) => {
    persistStages(sortedStages.map(s => s.id === stageId ? { ...s, autoSend } : s));
  };

  const confirmDeleteStage = () => {
    if (!deleteTarget) return;
    persistStages(sortedStages.filter(s => s.id !== deleteTarget.id).map((s, i) => ({ ...s, order: i + 1 })));
    setDeleteTarget(null);
  };

  const addStage = () => {
    if (!newStageName.trim() || !(posting || isPreset)) return;
    const statuses: StageStatus[] = newStageType === 'result' ? resultStatuses() : progressStatuses();
    const newStage: Stage = {
      id: crypto.randomUUID(),
      name: newStageName.trim(),
      order: sortedStages.length + 1,
      stageType: newStageType,
      statuses,
    };
    persistStages([...sortedStages, newStage]);
    setNewStageName('');
    setNewStageType('normal');
    setShowNewStage(false);
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">프로세스 관리</h2>
        <p className="text-sm text-muted-foreground">공고별 전형 단계와 자동 발송 설정을 관리합니다.</p>
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
          {sortedStages.map((stage, i) => (
            <div key={stage.id} className="card-elevated">
              <div className="flex items-center gap-3 p-4">
                <div className="flex flex-col gap-0.5">
                  <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={i === 0} onClick={() => moveStage(i, -1)}>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={i === sortedStages.length - 1} onClick={() => moveStage(i, 1)}>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
                <Input
                  className="max-w-xs h-9"
                  value={stage.name}
                  onChange={e => renameStage(stage.id, e.target.value)}
                />
                <Select value={stage.stageType} onValueChange={v => changeStageType(stage.id, v as StageType)}>
                  <SelectTrigger className="w-auto h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STAGE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>구분: {label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 flex-wrap">
                  {stage.statuses.map(status => (
                    <StatusBadge key={status.id} color={getStageColorHex(status.color)} className="text-[11px] px-1.5 py-0.5">
                      {status.name}
                      {status.isDefault ? ' (시작)' : ''}
                      {status.isCompletion ? ' (단계종료)' : ''}
                      {status.isPass ? ' (합격)' : ''}
                      {status.isFail ? ' (불합격)' : ''}
                    </StatusBadge>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setStatusModalStage(stage)}>
                    <Settings2 className="w-3.5 h-3.5 mr-1" /> 상태 관리
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(stage)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem value="autoSend" className="border-t border-b-0">
                  <AccordionTrigger className="px-4 py-2 text-xs text-muted-foreground hover:no-underline">
                    자동 발송 설정{stage.autoSend?.enabled ? ' (사용 중)' : ''}
                  </AccordionTrigger>
                  <AccordionContent>
                    <AutoSendPanel config={stage.autoSend} onSave={config => saveAutoSend(stage.id, config)} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}

          {showNewStage ? (
            <div className="card-elevated p-4 flex items-center gap-2">
              <Input
                className="max-w-xs h-9"
                value={newStageName}
                onChange={e => setNewStageName(e.target.value)}
                placeholder="새 단계 이름"
                autoFocus
              />
              <Select value={newStageType} onValueChange={v => setNewStageType(v as StageType)}>
                <SelectTrigger className="w-auto h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STAGE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>구분: {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          onSave={statuses => saveStatuses(statusModalStage.id, statuses)}
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
              {applicantCount > 0 && (
                <> 이 공고에는 지원자 {applicantCount}명이 있으며, 삭제 시 해당 지원자들의 이 단계 기록이 사라집니다.</>
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
