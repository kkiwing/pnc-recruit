import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getContrastTextColor } from '@/lib/colorContrast';

export interface StatusSelectOption {
  id: string;
  name: string;
  color: string;
}

interface Props {
  value: string;
  options: StatusSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

/** 색상 뱃지 + 드롭다운 화살표를 가진 상태 변경 셀렉트 (shadcn Select 기반). */
export default function StatusSelect({ value, options, onChange, className, disabled }: Props) {
  const selected = options.find(o => o.id === value);
  const bg = selected?.color ?? '#e5e7eb';
  const textColor = getContrastTextColor(bg);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={`h-8 w-auto min-w-[76px] gap-1 border-0 px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-ring focus:ring-offset-1 [&>span]:line-clamp-1 ${className ?? ''}`}
        style={{ backgroundColor: bg, color: textColor }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.id} value={option.id}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: option.color }} />
              {option.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
