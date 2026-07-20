import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn, toDateStr } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface Props {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

function parseDateStr(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** 한 캘린더에서 시작일 클릭 → 종료일 클릭으로 기간을 고르는 range 모드 날짜 선택기.
 * shadcn Calendar(react-day-picker) range 모드를 그대로 쓴다. */
export default function DateRangePicker({ startDate, endDate, onChange, className, placeholder = '기간을 선택하세요', disabled }: Props) {
  const range: DateRange | undefined = { from: parseDateStr(startDate), to: parseDateStr(endDate) };
  const label = startDate && endDate ? `${startDate} ~ ${endDate}` : startDate ? `${startDate} ~ ` : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} className={cn('justify-start font-normal w-full', className)}>
          <CalendarIcon className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={r => onChange(r?.from ? toDateStr(r.from) : '', r?.to ? toDateStr(r.to) : '')}
          defaultMonth={range.from}
          numberOfMonths={1}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
