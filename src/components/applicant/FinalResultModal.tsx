import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FinalResult } from '@/types/applicant';

interface Props {
  open: boolean;
  onClose: () => void;
  applicantName: string;
  finalResult: FinalResult | null;
  onSave: (result: FinalResult | null) => void;
}

/** 전형 단계와 무관하게 지정하는 최종 합불 판정 모달. 특별 채용처럼 구조상 예외인
 * 케이스는 메모로 남긴다("구조는 단순하게, 예외는 메모로"). */
export default function FinalResultModal({ open, onClose, applicantName, finalResult, onSave }: Props) {
  const [result, setResult] = useState<'합격' | '불합격' | null>(finalResult?.result ?? null);
  const [note, setNote] = useState(finalResult?.note ?? '');

  const handleSave = () => {
    if (!result) return;
    onSave({ result, note: note.trim() || undefined, decidedAt: new Date().toISOString() });
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{applicantName} — 최종 결과</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={result === '합격' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setResult('합격')}
            >
              합격
            </Button>
            <Button
              type="button"
              variant={result === '불합격' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setResult('불합격')}
            >
              불합격
            </Button>
          </div>
          <Textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="메모 (선택) — 예: 임원 추천 특별 채용"
            rows={3}
          />
        </div>
        <DialogFooter className="sm:justify-between">
          {finalResult ? (
            <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleClear}>
              판정 해제
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={handleSave} disabled={!result}>저장</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
