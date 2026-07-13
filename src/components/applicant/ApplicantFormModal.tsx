import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import { Gender } from '@/types/applicant';

interface Props {
  open: boolean;
  onClose: () => void;
  editData?: any;
  defaultJobPostingId?: string;
}

const PLATFORMS = ['사람인', '잡코리아', '워크넷', '인크루트', '링크드인', '직접지원', '기타'];

export default function ApplicantFormModal({ open, onClose, editData, defaultJobPostingId }: Props) {
  const { addApplicant, updateApplicant } = useApplicants();
  const { jobPostings } = useJobPostings();
  const [form, setForm] = useState({
    jobPostingId: editData?.jobPostingId || defaultJobPostingId || '',
    team: editData?.team || '',
    name: editData?.name || '',
    platform: editData?.platform || '',
    birthYear: editData?.birthYear || '',
    gender: editData?.gender || '남성',
    birthDate: editData?.birthDate || '',
    email: editData?.email || '',
    phone: editData?.phone || '',
    region: editData?.region || '',
    regionDetail: editData?.regionDetail || '',
    address: editData?.address || '',
    school: editData?.educations?.[0]?.schoolName || '',
    major: editData?.educations?.[0]?.major || '',
    memo: editData?.memo || '',
    applicationDate: editData?.applicationDate || new Date().toISOString().slice(0, 10),
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.jobPostingId) return;
    const { school, major, gender, ...rest } = form;
    if (editData?.id) {
      updateApplicant(editData.id, {
        ...rest,
        gender: gender as Gender,
        educations: [{
          schoolName: school,
          degree: '대학교',
          period: '',
          majorField: '',
          major,
          gpa: 0,
          gpaMax: 4.5,
        }],
      });
    } else {
      addApplicant({
        ...rest,
        gender: gender as Gender,
        educations: school || major ? [{
          schoolName: school,
          degree: '대학교',
          period: '',
          majorField: '',
          major,
          gpa: 0,
          gpaMax: 4.5,
        }] : [],
        certificates: [],
        careers: [],
        activities: [],
        statisticsPackages: [],
        coverLetter: [],
        submissionStatus: '미완료',
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? '지원자 정보 수정' : '지원자 등록'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label>채용 공고 *</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.jobPostingId}
              onChange={e => handleChange('jobPostingId', e.target.value)}
            >
              <option value="">공고 선택</option>
              {jobPostings.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div>
            <Label>팀</Label>
            <Input value={form.team} onChange={e => handleChange('team', e.target.value)} placeholder="팀명" />
          </div>
          <div>
            <Label>이름 *</Label>
            <Input value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="이름" />
          </div>
          <div>
            <Label>성별</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.gender}
              onChange={e => handleChange('gender', e.target.value)}
            >
              <option value="남성">남성</option>
              <option value="여성">여성</option>
            </select>
          </div>
          <div>
            <Label>생년월일</Label>
            <Input type="date" value={form.birthDate} onChange={e => handleChange('birthDate', e.target.value)} />
          </div>
          <div>
            <Label>지원일</Label>
            <Input type="date" value={form.applicationDate} onChange={e => handleChange('applicationDate', e.target.value)} />
          </div>
          <div>
            <Label>지원플랫폼</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.platform}
              onChange={e => handleChange('platform', e.target.value)}
            >
              <option value="">선택</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <Label>출생연도</Label>
            <Input value={form.birthYear} onChange={e => handleChange('birthYear', e.target.value)} placeholder="1990" />
          </div>
          <div>
            <Label>이메일</Label>
            <Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@example.com" />
          </div>
          <div>
            <Label>휴대전화번호</Label>
            <Input value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="010-0000-0000" />
          </div>
          <div>
            <Label>지역 (시/도)</Label>
            <Input value={form.region} onChange={e => handleChange('region', e.target.value)} placeholder="서울" />
          </div>
          <div>
            <Label>지역 (시/군/구)</Label>
            <Input value={form.regionDetail} onChange={e => handleChange('regionDetail', e.target.value)} placeholder="강남구" />
          </div>
          <div className="col-span-2">
            <Label>상세 주소</Label>
            <Input value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="상세 주소를 입력하세요" />
          </div>
          <div>
            <Label>학교</Label>
            <Input value={form.school} onChange={e => handleChange('school', e.target.value)} placeholder="OO대학교" />
          </div>
          <div>
            <Label>전공</Label>
            <Input value={form.major} onChange={e => handleChange('major', e.target.value)} placeholder="경영학" />
          </div>
          <div className="col-span-2">
            <Label>특이사항 메모</Label>
            <Textarea value={form.memo} onChange={e => handleChange('memo', e.target.value)} placeholder="특이사항을 입력하세요" rows={3} />
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
