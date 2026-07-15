import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn, toDateStr } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

function parseDateStr(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** 단일 날짜 하나만 필요한 곳(생년월일, 지원일 등)에 쓰는 single 모드 날짜 선택기. */
export default function DatePicker({ value, onChange, className, placeholder = '날짜를 선택하세요' }: Props) {
  const selected = parseDateStr(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={cn('justify-start font-normal w-full', className)}>
          <CalendarIcon className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate">{value || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={d => onChange(d ? toDateStr(d) : '')}
          defaultMonth={selected}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
