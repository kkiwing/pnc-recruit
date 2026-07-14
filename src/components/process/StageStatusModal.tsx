import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Stage, StageStatus, STAGE_COLOR_PALETTE } from '@/types/jobPosting';
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

  const setDefault = (id: string) => {
    setStatuses(prev => prev.map(s => ({ ...s, isDefault: s.id === id })));
  };

  const setCompletion = (id: string) => {
    setStatuses(prev => prev.map(s => ({ ...s, isCompletion: s.id === id })));
  };

  const setPass = (id: string) => {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, isPass: true, isFail: false } : { ...s, isPass: false }));
  };

  const setFail = (id: string) => {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, isFail: true, isPass: false } : { ...s, isFail: false }));
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
    if (!cleaned.some(s => s.isDefault)) cleaned[0].isDefault = true;
    onSave(cleaned);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>"{stage.name}" 상태값 관리</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {statuses.map((status, i) => (
            <div key={status.id} className="flex items-center gap-2 bg-muted/40 rounded-md p-2">
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
                className="h-8 flex-1"
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
              <Tooltip>
                <TooltipTrigger asChild>
                  {status.isDefault ? (
                    <Badge variant="outline" className="text-[10px] shrink-0">시작 상태</Badge>
                  ) : (
                    <button
                      type="button"
                      className="text-[10px] text-muted-foreground hover:text-foreground shrink-0 underline"
                      onClick={() => setDefault(status.id)}
                    >
                      시작 상태로
                    </button>
                  )}
                </TooltipTrigger>
                <TooltipContent>지원자가 이 단계에 도착하면 자동으로 갖는 상태</TooltipContent>
              </Tooltip>
              {stage.stageType === 'normal' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {status.isCompletion ? (
                      <Badge variant="success" className="text-[10px] shrink-0">완료</Badge>
                    ) : (
                      <button
                        type="button"
                        className="text-[10px] text-muted-foreground hover:text-foreground shrink-0 underline"
                        onClick={() => setCompletion(status.id)}
                      >
                        완료로
                      </button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>이 상태가 되면 단계 완료로 집계</TooltipContent>
                </Tooltip>
              )}
              {stage.stageType === 'result' && (
                <>
                  {status.isPass ? (
                    <Badge variant="success" className="text-[10px] shrink-0">합격</Badge>
                  ) : (
                    <button
                      type="button"
                      className="text-[10px] text-muted-foreground hover:text-foreground shrink-0 underline"
                      onClick={() => setPass(status.id)}
                    >
                      합격으로
                    </button>
                  )}
                  {status.isFail ? (
                    <Badge variant="destructive" className="text-[10px] shrink-0">불합격</Badge>
                  ) : (
                    <button
                      type="button"
                      className="text-[10px] text-muted-foreground hover:text-foreground shrink-0 underline"
                      onClick={() => setFail(status.id)}
                    >
                      불합격으로
                    </button>
                  )}
                </>
              )}
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
