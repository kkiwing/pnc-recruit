import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Applicant, FileAttachment } from '@/types/applicant';
import { useApplicants } from '@/context/ApplicantContext';
import { FileText, Trash2, Upload, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  applicant: Applicant;
}

export default function ApplicantDetailModal({ open, onClose, applicant }: Props) {
  const { updateApplicant } = useApplicants();
  const [memo, setMemo] = useState(applicant.memo);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: FileAttachment[] = Array.from(files).map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
      uploadedAt: new Date().toISOString(),
    }));
    updateApplicant(applicant.id, { files: [...applicant.files, ...newFiles] });
  };

  const removeFile = (fileId: string) => {
    updateApplicant(applicant.id, { files: applicant.files.filter(f => f.id !== fileId) });
  };

  const saveMemo = () => {
    updateApplicant(applicant.id, { memo });
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{applicant.name} - 지원자 상세</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">팀:</span> {applicant.team}</div>
            <div><span className="text-muted-foreground">플랫폼:</span> {applicant.platform}</div>
            <div><span className="text-muted-foreground">출생연도:</span> {applicant.birthYear}</div>
            <div><span className="text-muted-foreground">이메일:</span> {applicant.email}</div>
            <div><span className="text-muted-foreground">전화:</span> {applicant.phone}</div>
            <div><span className="text-muted-foreground">지역:</span> {applicant.region} {applicant.regionDetail}</div>
            <div><span className="text-muted-foreground">학교:</span> {applicant.educations[0]?.schoolName ?? '-'}</div>
            <div><span className="text-muted-foreground">전공:</span> {applicant.educations[0]?.major ?? '-'}</div>
            <div className="col-span-2"><span className="text-muted-foreground">경력:</span> {applicant.careers.length > 0 ? `${applicant.careers.length}건` : '신입'}</div>
          </div>

          <div>
            <Label>특이사항 메모</Label>
            <Textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} className="mt-1" />
            <Button size="sm" className="mt-2" onClick={saveMemo}>메모 저장</Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>첨부 파일</Label>
              <label className="cursor-pointer">
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <Upload className="w-3 h-3" /> 파일 추가
                </span>
              </label>
            </div>
            {applicant.files.length === 0 ? (
              <p className="text-sm text-muted-foreground">첨부된 파일이 없습니다.</p>
            ) : (
              <ul className="space-y-1">
                {applicant.files.map(f => (
                  <li key={f.id} className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="truncate max-w-[250px]">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(f.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
