import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Stage, StageStatus, STAGE_COLOR_PALETTE, syncDefaultStatus } from '@/types/jobPosting';
import { Plus, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  stage: Stage;
  onSave: (statuses: StageStatus[]) => void;
}

export default function StageStatusModal({ open, onClose, stage, onSave }: Props) {
  const [statuses, setStatuses] = useState<StageStatus[]>(stage.statuses);

  const addStatus = () => {
    setStatuses(prev => [...prev, { id: crypto.randomUUID(), name: '', color: STAGE_COLOR_PALETTE[prev.length % STAGE_COLOR_PALETTE.length].id }]);
  };

  const removeStatus = (id: string) => {
    setStatuses(prev => prev.filter(s => s.id !== id));
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

  const handleSave = () => {
    const cleaned = statuses.filter(s => s.name.trim());
    if (cleaned.length === 0) return;
    onSave(syncDefaultStatus(cleaned));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>"{stage.name}" 상태값 관리</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          목록 맨 위 상태가 시작 상태입니다. 화살표로 순서를 바꾸면 시작 상태도 함께 바뀝니다.
        </p>
        <div className="space-y-2 py-2">
          {statuses.map((status, i) => (
            <div key={status.id} className="flex items-center gap-2 bg-muted/40 rounded-md p-2 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => moveStatus(i, -1)}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={i === statuses.length - 1}
                  onClick={() => moveStatus(i, 1)}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <Input
                className="h-8 flex-1 min-w-[100px]"
                value={status.name}
                onChange={e => renameStatus(status.id, e.target.value)}
                placeholder="상태 이름"
              />
              <div className="flex items-center gap-1">
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
              {i === 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-[10px] shrink-0">시작</Badge>
                  </TooltipTrigger>
                  <TooltipContent>지원자가 이 단계에 도착하면 자동으로 갖는 상태</TooltipContent>
                </Tooltip>
              )}
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
              <button type="button" className="text-destructive hover:text-destructive/80 shrink-0" onClick={() => removeStatus(status.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
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
    </Dialog>
  );
}
