import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DateRangePicker from '@/components/common/DateRangePicker';
import TimeSelect from '@/components/common/TimeSelect';
import { toDateStr } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  stepLabel: string;
  initialData?: { startDate?: string; endDate?: string; time?: string; note?: string };
  onSubmit: (data: { startDate: string; endDate: string; time?: string; note?: string }) => void;
}

/** 상태에 hasDateInput이 켜져 있을 때 뜨는 날짜(기간)+시간(선택)+메모 입력 모달. */
export default function CompletionDateModal({ open, onClose, stepLabel, initialData, onSubmit }: Props) {
  const [startDate, setStartDate] = useState(initialData?.startDate || toDateStr(new Date()));
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = () => {
    if (!endDate) return;
    onSubmit({ startDate, endDate, time: time || undefined, note: note || undefined });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{stepLabel} 정보 입력</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>기간</Label>
            <DateRangePicker startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
          </div>
          <div>
            <Label>시간 <span className="text-xs text-muted-foreground font-normal">(선택)</span></Label>
            <TimeSelect value={time} onChange={setTime} />
          </div>
          <div>
            <Label>메모 <span className="text-xs text-muted-foreground font-normal">(선택)</span></Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="담당자, 특이사항 등을 남기세요" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
