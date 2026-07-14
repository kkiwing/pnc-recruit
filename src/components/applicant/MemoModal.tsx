import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  open: boolean;
  onClose: () => void;
  applicantId: string;
  applicantName: string;
  memo: string;
  onSave: (memo: string) => void;
}

/** 목록 화면에서 바로 메모를 보고 수정하는 모달. 텍스트 메모 전용 — 첨부파일은 상세 페이지에서 관리한다. */
export default function MemoModal({ open, onClose, applicantId, applicantName, memo, onSave }: Props) {
  const [draft, setDraft] = useState(memo);

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{applicantName} — 메모</DialogTitle>
        </DialogHeader>
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={6}
          placeholder="특이사항을 입력하세요"
          autoFocus
        />
        <Link to={`/applicants/${applicantId}`} className="text-xs text-link hover:underline">
          상세에서 관리
        </Link>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
