import React, { useState } from 'react';
import { useJobPostings } from '@/context/JobPostingContext';
import { useApplicants } from '@/context/ApplicantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Stage, StageType, StageStatus, CompletionFormType, AutoSendConfig, getStageColorClass } from '@/types/jobPosting';
import { Plus, Trash2, ChevronUp, ChevronDown, Settings2, AlertTriangle } from 'lucide-react';
import StageStatusModal from '@/components/process/StageStatusModal';
import AutoSendPanel from '@/components/process/AutoSendPanel';

const COMPLETION_FORM_LABELS: Record<CompletionFormType, string> = {
  none: '없음',
  period: '기간(안내일/마감일)',
  interview: '면접(기간+시간+담당자)',
};

const STAGE_TYPE_LABELS: Record<StageType, string> = {
  normal: '일반',
  result: '합불 판정',
};

export default function ProcessManagementPage() {
  const { jobPostings, updateJobPosting } = useJobPostings();
  const { applicants } = useApplicants();
  const [selectedId, setSelectedId] = useState(jobPostings[0]?.id ?? '');
  const [statusModalStage, setStatusModalStage] = useState<Stage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Stage | null>(null);
  const [showNewStage, setShowNewStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageForm, setNewStageForm] = useState<CompletionFormType>('none');
  const [newStageType, setNewStageType] = useState<StageType>('normal');

  const posting = jobPostings.find(j => j.id === selectedId);
  const applicantCount = posting ? applicants.filter(a => a.jobPostingId === posting.id).length : 0;

  if (jobPostings.length === 0) {
    return <div className="p-6 text-sm text-muted-foreground">등록된 채용 공고가 없습니다. 먼저 공고를 등록해주세요.</div>;
  }

  const sortedStages = posting ? [...posting.stages].sort((a, b) => a.order - b.order) : [];

  const persistStages = (stages: Stage[]) => {
    if (posting) updateJobPosting(posting.id, { stages });
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

  const changeCompletionForm = (stageId: string, completionForm: CompletionFormType) => {
    persistStages(sortedStages.map(s => s.id === stageId ? { ...s, completionForm } : s));
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
    if (!newStageName.trim() || !posting) return;
    const statuses: StageStatus[] = newStageType === 'result'
      ? [
          { id: crypto.randomUUID(), name: '대기', color: 'gray', isDefault: true },
          { id: crypto.randomUUID(), name: '합격', color: 'blue', isPass: true },
          { id: crypto.randomUUID(), name: '불합격', color: 'red', isFail: true },
        ]
      : [{ id: crypto.randomUUID(), name: '대기', color: 'gray', isDefault: true }];
    const newStage: Stage = {
      id: crypto.randomUUID(),
      name: newStageName.trim(),
      order: sortedStages.length + 1,
      stageType: newStageType,
      completionForm: newStageForm,
      statuses,
    };
    persistStages([...sortedStages, newStage]);
    setNewStageName('');
    setNewStageForm('none');
    setNewStageType('normal');
    setShowNewStage(false);
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">프로세스 관리</h2>
        <p className="text-sm text-muted-foreground">공고별 전형 단계와 자동 발송 설정을 관리합니다.</p>
      </div>

      <div className="mb-5 max-w-md">
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          {jobPostings.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {posting && (
        <div className="space-y-3">
          {sortedStages.map((stage, i) => (
            <div key={stage.id} className="bg-card rounded-lg border shadow-sm">
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
                <select
                  className="flex h-9 rounded-md border border-input bg-background px-2 text-xs"
                  value={stage.stageType}
                  onChange={e => changeStageType(stage.id, e.target.value as StageType)}
                >
                  {Object.entries(STAGE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>구분: {label}</option>
                  ))}
                </select>
                <select
                  className="flex h-9 rounded-md border border-input bg-background px-2 text-xs"
                  value={stage.completionForm}
                  onChange={e => changeCompletionForm(stage.id, e.target.value as CompletionFormType)}
                >
                  {Object.entries(COMPLETION_FORM_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>완료 입력폼: {label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 flex-wrap">
                  {stage.statuses.map(status => (
                    <span key={status.id} className={`text-[11px] px-1.5 py-0.5 rounded ${getStageColorClass(status.color)}`}>
                      {status.name}
                      {status.isDefault ? ' (기본)' : ''}
                      {status.isCompletion ? ' (완료)' : ''}
                      {status.isPass ? ' (합격)' : ''}
                      {status.isFail ? ' (불합격)' : ''}
                    </span>
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
            <div className="bg-card rounded-lg border shadow-sm p-4 flex items-center gap-2">
              <Input
                className="max-w-xs h-9"
                value={newStageName}
                onChange={e => setNewStageName(e.target.value)}
                placeholder="새 단계 이름"
                autoFocus
              />
              <select
                className="flex h-9 rounded-md border border-input bg-background px-2 text-xs"
                value={newStageType}
                onChange={e => setNewStageType(e.target.value as StageType)}
              >
                {Object.entries(STAGE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>구분: {label}</option>
                ))}
              </select>
              <select
                className="flex h-9 rounded-md border border-input bg-background px-2 text-xs"
                value={newStageForm}
                onChange={e => setNewStageForm(e.target.value as CompletionFormType)}
              >
                {Object.entries(COMPLETION_FORM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>완료 입력폼: {label}</option>
                ))}
              </select>
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
