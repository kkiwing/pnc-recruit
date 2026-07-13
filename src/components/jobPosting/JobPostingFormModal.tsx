import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useJobPostings } from '@/context/JobPostingContext';
import { JobPosting, createDefaultCoverLetterQuestions } from '@/types/jobPosting';

interface Props {
  open: boolean;
  onClose: () => void;
  editData?: JobPosting;
}

export default function JobPostingFormModal({ open, onClose, editData }: Props) {
  const { addJobPosting, updateJobPosting } = useJobPostings();
  const [form, setForm] = useState({
    title: editData?.title || '',
    department: editData?.department || '',
    startDate: editData?.startDate || new Date().toISOString().slice(0, 10),
    endDate: editData?.endDate || '',
    description: editData?.description || '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (editData?.id) {
      updateJobPosting(editData.id, form);
    } else {
      addJobPosting({
        ...form,
        careerType: '신입',
        isPublic: true,
        content: form.description,
        coverLetterQuestions: createDefaultCoverLetterQuestions(),
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editData ? '공고 수정' : '공고 등록'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label>공고 제목 *</Label>
            <Input value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="예: 2026 상반기 백엔드 개발자 채용" />
          </div>
          <div className="col-span-2">
            <Label>부서</Label>
            <Input value={form.department} onChange={e => handleChange('department', e.target.value)} placeholder="개발팀" />
          </div>
          <div>
            <Label>시작일</Label>
            <Input type="date" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} />
          </div>
          <div>
            <Label>마감일</Label>
            <Input type="date" value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>상세 내용</Label>
            <Textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="공고 상세 설명을 입력하세요" rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>{editData ? '수정' : '등록'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
