import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Applicant } from '@/types/applicant';

interface Props {
  open: boolean;
  onClose: () => void;
  applicant: Applicant;
  onSave: (reason: string) => void;
}

function formatDateTime(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 별도 관리로 "이동"(신규)과 이동된 뒤 사유를 "수정"을 겸하는 모달. 별도 프롭 없이
 * applicant.isSeparateManagement로 모드를 구분한다 — 이미 별도관리 중이면 사유 수정,
 * 아니면 신규 이동으로 취급한다. 지원자 목록/별도 관리 화면 등 모든 진입점이 이
 * 모달 하나를 공유한다.
 */
export default function SeparateManagementModal({ open, onClose, applicant, onSave }: Props) {
  const isEdit = applicant.isSeparateManagement;
  const [reason, setReason] = useState(applicant.separateReason ?? '');

  const handleSave = () => {
    if (!reason.trim()) return;
    onSave(reason.trim());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{applicant.name} — 별도 관리 {isEdit ? '사유' : '이동'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {isEdit && (
            <p className="text-xs text-muted-foreground">이동 일시: {formatDateTime(applicant.separatedAt)}</p>
          )}
          <Textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="별도 관리로 옮기는 사유를 입력하세요"
            rows={4}
            autoFocus
          />
          {!isEdit && (
            <p className="text-xs text-muted-foreground">별도 관리로 이동하면 지원자 목록에서 제외됩니다.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={!reason.trim()}>{isEdit ? '저장' : '이동'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
