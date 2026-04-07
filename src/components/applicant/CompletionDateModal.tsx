import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onClose: () => void;
  stepLabel: string;
  isInterview?: boolean;
  initialData?: { startDate?: string; endDate?: string; time?: string; interviewer?: string };
  onSubmit: (data: { startDate: string; endDate: string; time?: string; interviewer?: string }) => void;
}

export default function CompletionDateModal({ open, onClose, stepLabel, isInterview, initialData, onSubmit }: Props) {
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [interviewer, setInterviewer] = useState(initialData?.interviewer || '');

  const handleSubmit = () => {
    if (!endDate) return;
    onSubmit({ startDate, endDate, time: isInterview ? time : undefined, interviewer: isInterview ? interviewer : undefined });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{stepLabel} - 완료 처리</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>안내일 (시작일)</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>마감일</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          {isInterview && (
            <>
              <div>
                <Label>면접 시간</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
              <div>
                <Label>면접 담당자</Label>
                <Input value={interviewer} onChange={e => setInterviewer(e.target.value)} placeholder="담당자명" />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
