import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { Stage, StageStatus, STAGE_COLOR_PALETTE, syncDefaultStatus } from '@/types/jobPosting';
import { Applicant } from '@/types/applicant';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Check, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  stage: Stage;
  /** 이 단계가 속한 공고의 지원자 전체. 프리셋 편집 중에는 빈 배열(지원자 개념이 없음). */
  applicants: Applicant[];
  onSave: (statuses: StageStatus[]) => void;
  /** 상태 삭제 확정 시 그 상태였던 지원자를 새 시작 상태로 옮기고, 상태 목록도 즉시 저장한다. */
  onDeleteStatus: (deletedStatusId: string, nextStatuses: StageStatus[]) => void;
}

export default function StageStatusModal({ open, onClose, stage, applicants, onSave, onDeleteStatus }: Props) {
  const [statuses, setStatuses] = useState<StageStatus[]>(stage.statuses);
  const [deleteTarget, setDeleteTarget] = useState<StageStatus | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const addStatus = () => {
    setStatuses(prev => [...prev, { id: crypto.randomUUID(), name: '', color: STAGE_COLOR_PALETTE[prev.length % STAGE_COLOR_PALETTE.length].id }]);
  };

  const renameStatus = (id: string, name: string) => {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const recolorStatus = (id: string, color: string) => {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, color } : s));
  };

  /** "단계 종료" 체크: 체크한 상태를 목록 맨 아래로 옮기고, 다른 상태의 종료
   * 체크는 자동으로 해제한다 — 한 단계에서 "종료"는 항상 하나만 유지된다. */
  const toggleCompletion = (id: string) => {
    setStatuses(prev => {
      const target = prev.find(s => s.id === id);
      if (!target) return prev;
      const turningOn = !target.isCompletion;
      const next = prev.map(s => ({ ...s, isCompletion: s.id === id ? turningOn : false }));
      if (!turningOn) return next;
      const idx = next.findIndex(s => s.id === id);
      const [item] = next.splice(idx, 1);
      next.push(item);
      return next;
    });
  };

  const toggleDateInput = (id: string) => {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, hasDateInput: !s.hasDateInput } : s));
  };

  const moveStatus = (index: number, dir: -1 | 1) => {
    setStatuses(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const applicantCountFor = (statusId: string) =>
    applicants.filter(a => a.stageRecords.some(r => r.stageId === stage.id && r.statusId === statusId)).length;

  /** 삭제 확정: 지원자 이동 + 상태 목록 즉시 저장을 한 번에 커밋한다. 취소 불가능한
   * 실제 부수효과(지원자 이동)를 수반하므로, 이름/색상 등 다른 draft 변경과 달리
   * "저장" 버튼을 기다리지 않고 확인 즉시 반영한다. */
  const confirmDeleteStatus = () => {
    if (!deleteTarget) return;
    const nextStatuses = syncDefaultStatus(statuses.filter(s => s.id !== deleteTarget.id));
    setStatuses(nextStatuses);
    onDeleteStatus(deleteTarget.id, nextStatuses);
    setDeleteTarget(null);
  };

  const handleSave = () => {
    const cleaned = statuses.filter(s => s.name.trim());
    if (cleaned.length === 0) return;
    onSave(syncDefaultStatus(cleaned));
    onClose();
  };

  const deleteImpactCount = deleteTarget ? applicantCountFor(deleteTarget.id) : 0;
  const deleteTargetIsDefault = deleteTarget ? statuses[0]?.id === deleteTarget.id : false;
  const nextDefaultName = deleteTarget ? statuses.find(s => s.id !== deleteTarget.id)?.name : undefined;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>"{stage.name}" 상태값 관리</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          목록 맨 위 상태가 시작 상태입니다. 좌측 핸들을 눌러 순서를 바꾸면 시작 상태도 함께 바뀝니다.
        </p>
        <div className="space-y-2 py-2">
          {statuses.map((status, i) => (
            <div key={status.id} className="flex items-stretch gap-2 bg-muted/40 rounded-md p-2">
              <Popover open={openMenuId === status.id} onOpenChange={o => setOpenMenuId(o ? status.id : null)}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-center px-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer"
                    aria-label="순서 변경"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-36 p-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => { moveStatus(i, -1); setOpenMenuId(null); }}
                    className="w-full flex items-center gap-1.5 text-left text-xs px-2 py-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3.5 h-3.5" /> 위로 이동
                  </button>
                  <button
                    type="button"
                    disabled={i === statuses.length - 1}
                    onClick={() => { moveStatus(i, 1); setOpenMenuId(null); }}
                    className="w-full flex items-center gap-1.5 text-left text-xs px-2 py-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3.5 h-3.5" /> 아래로 이동
                  </button>
                </PopoverContent>
              </Popover>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 flex-1 min-w-[100px]"
                    value={status.name}
                    onChange={e => renameStatus(status.id, e.target.value)}
                    placeholder="상태 이름"
                  />
                  {i === 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-[10px] shrink-0">시작</Badge>
                      </TooltipTrigger>
                      <TooltipContent>지원자가 이 단계에 도착하면 자동으로 갖는 상태</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 shrink-0">
                    {STAGE_COLOR_PALETTE.map(swatch => (
                      <button
                        key={swatch.id}
                        type="button"
                        title={swatch.label}
                        onClick={() => recolorStatus(status.id, swatch.id)}
                        style={{ backgroundColor: swatch.hex }}
                        className={`w-5 h-5 rounded-full border-2 ${status.color === swatch.id ? 'border-foreground' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 cursor-pointer">
                          <input type="checkbox" checked={!!status.isCompletion} onChange={() => toggleCompletion(status.id)} />
                          단계종료
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>이 상태가 되면 단계 종료로 집계</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 cursor-pointer">
                          <input type="checkbox" checked={!!status.hasDateInput} onChange={() => toggleDateInput(status.id)} />
                          날짜+메모
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>이 상태로 바꿀 때 날짜(기간)+시간+메모 입력 모달을 띄움</TooltipContent>
                    </Tooltip>
                    {statuses.length <= 1 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-destructive/40 shrink-0 cursor-not-allowed">
                            <Trash2 className="w-3.5 h-3.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>최소 1개의 상태가 필요합니다</TooltipContent>
                      </Tooltip>
                    ) : (
                      <button type="button" className="text-destructive hover:text-destructive/80 shrink-0" onClick={() => setDeleteTarget(status)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addStatus} className="w-full">
            <Plus className="w-3.5 h-3.5 mr-1" /> 상태 추가
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}><Check className="w-3.5 h-3.5 mr-1" /> 저장</Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> "{deleteTarget?.name}" 상태를 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteImpactCount > 0 && (
                <> 해당 상태인 지원자가 {deleteImpactCount}명 있으며, 해당 지원자는 이 단계의 시작 상태로 이동됩니다.</>
              )}
              {deleteTargetIsDefault && nextDefaultName && (
                <> 삭제 후 "{nextDefaultName}"이(가) 시작 상태가 됩니다.</>
              )}
              {' '}이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDeleteStatus}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
