import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 6 }, (_, i) => String(i * 10).padStart(2, '0'));

/** 시(00~23)/분(10분 단위) 셀렉트 조합으로 "HH:MM" 문자열을 만든다. */
export default function TimeSelect({ value, onChange, className, disabled }: Props) {
  const [hour, minute] = value ? value.split(':') : ['', ''];

  const setHour = (h: string) => onChange(`${h}:${minute || '00'}`);
  const setMinute = (m: string) => onChange(`${hour || '00'}:${m}`);

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
      <Select value={hour || undefined} onValueChange={setHour} disabled={disabled}>
        <SelectTrigger className="w-20"><SelectValue placeholder="시" /></SelectTrigger>
        <SelectContent>
          {HOURS.map(h => <SelectItem key={h} value={h}>{h}시</SelectItem>)}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minute || undefined} onValueChange={setMinute} disabled={disabled}>
        <SelectTrigger className="w-20"><SelectValue placeholder="분" /></SelectTrigger>
        <SelectContent>
          {MINUTES.map(m => <SelectItem key={m} value={m}>{m}분</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
