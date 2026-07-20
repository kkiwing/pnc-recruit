import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/common/DateRangePicker';
import FieldAutocomplete from '@/components/common/FieldAutocomplete';
import { useJobPostings } from '@/context/JobPostingContext';
import { useProcessPreset } from '@/context/ProcessPresetContext';
import {
  JobPosting, CareerType, EmploymentType, CoverLetterQuestion,
  createDefaultCoverLetterQuestions, cloneStages,
} from '@/types/jobPosting';
import { toDateStr } from '@/lib/utils';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  editData?: JobPosting;
}

export default function JobPostingFormModal({ open, onClose, editData }: Props) {
  const { jobPostings, addJobPosting, updateJobPosting } = useJobPostings();
  const { presetStages } = useProcessPreset();
  const fieldSuggestions = Array.from(new Set(jobPostings.map(j => j.field))).filter(Boolean);
  const [form, setForm] = useState({
    title: editData?.title || '',
    field: editData?.field || '',
    careerType: (editData?.careerType || '신입') as CareerType,
    employmentType: (editData?.employmentType || '정규직') as EmploymentType,
    startDate: editData?.startDate || toDateStr(new Date()),
    endDate: editData?.endDate || '',
    isPublic: editData?.isPublic ?? true,
    description: editData?.description || '',
    content: editData?.content || '',
  });
  const [questions, setQuestions] = useState<CoverLetterQuestion[]>(
    editData?.coverLetterQuestions || createDefaultCoverLetterQuestions()
  );

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { id: crypto.randomUUID(), question: '' }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestionText = (id: string, question: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, question } : q));
  };

  const updateMaxLength = (id: string, maxLength: string) => {
    const value = maxLength ? Number(maxLength) : undefined;
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, maxLength: value } : q));
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    setQuestions(prev => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const data = { ...form, coverLetterQuestions: questions };
    if (editData?.id) {
      updateJobPosting(editData.id, data);
    } else {
      addJobPosting({ ...data, stages: cloneStages(presetStages) });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? '공고 수정' : '공고 등록'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label>공고 제목 *</Label>
            <Input value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="예: 2026 상반기 백엔드 개발자 채용" />
          </div>
          <div>
            <Label>모집 분야</Label>
            <FieldAutocomplete
              value={form.field}
              onChange={v => handleChange('field', v)}
              suggestions={fieldSuggestions}
              placeholder="예: 개발, UX 디자이너, 데이터 분석"
            />
          </div>
          <div>
            <Label>구분</Label>
            <Select value={form.careerType} onValueChange={v => handleChange('careerType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="신입">신입</SelectItem>
                <SelectItem value="경력">경력</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>고용 형태</Label>
            <Select value={form.employmentType} onValueChange={v => handleChange('employmentType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="정규직">정규직</SelectItem>
                <SelectItem value="계약직">계약직</SelectItem>
                <SelectItem value="인턴">인턴</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>게시기간</Label>
            <DateRangePicker
              startDate={form.startDate}
              endDate={form.endDate}
              onChange={(startDate, endDate) => setForm(prev => ({ ...prev, startDate, endDate }))}
            />
          </div>
          <div className="col-span-2 flex items-center justify-between card-soft px-3 py-2">
            <div>
              <Label className="mb-0">공개 여부</Label>
              <p className="text-xs text-muted-foreground">비공개로 설정하면 채용 페이지에 노출되지 않습니다.</p>
            </div>
            <Switch checked={form.isPublic} onCheckedChange={checked => setForm(prev => ({ ...prev, isPublic: checked }))} />
          </div>
          <div className="col-span-2">
            <Label>공고 요약</Label>
            <Input value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="목록에 노출될 한 줄 요약" />
          </div>
          <div className="col-span-2">
            <Label>공고 본문</Label>
            <Textarea value={form.content} onChange={e => handleChange('content', e.target.value)} placeholder="공고 상세 내용을 입력하세요" rows={6} />
          </div>

          <div className="col-span-2 border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="mb-0">자기소개서 문항</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-3.5 h-3.5 mr-1" /> 문항 추가
              </Button>
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-2 bg-muted/40 rounded-md p-2">
                  <div className="flex flex-col gap-0.5 pt-1">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={i === 0}
                      onClick={() => moveQuestion(i, -1)}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={i === questions.length - 1}
                      onClick={() => moveQuestion(i, 1)}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Textarea
                      value={q.question}
                      onChange={e => updateQuestionText(q.id, e.target.value)}
                      placeholder={`문항 ${i + 1} 내용을 입력하세요`}
                      rows={2}
                      className="bg-background"
                    />
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-muted-foreground mb-0">최대 글자수</Label>
                      <Input
                        type="number"
                        className="h-7 w-24 text-xs"
                        value={q.maxLength ?? ''}
                        onChange={e => updateMaxLength(q.id, e.target.value)}
                        placeholder="제한 없음"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-destructive hover:text-destructive/80 pt-1"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">등록된 자기소개서 문항이 없습니다.</p>
              )}
            </div>
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
