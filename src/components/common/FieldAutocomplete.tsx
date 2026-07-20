import React, { useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** 지금까지 쓰인 값 목록(마스터 데이터 아님) — 입력하는 대로 매칭되는 것만 추천한다. */
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

/** "모집 분야" 같이 구조화된 값 목록을 별도로 관리하지 않는 자유 텍스트 필드용
 * 자동완성 인풋. 관리되는 마스터 데이터가 아니라 기존에 입력된 값들 중 지금
 * 입력한 문자열을 포함하는 것만 추천하며, 목록에 없는 새 값도 항상 그대로
 * 입력할 수 있다(2026-07-21 — 조직 구분 필드 통합). */
export default function FieldAutocomplete({ value, onChange, suggestions, placeholder, className }: Props) {
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>();

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    const pool = Array.from(new Set(suggestions.filter(Boolean)));
    const filtered = query ? pool.filter(s => s.toLowerCase().includes(query) && s !== value) : pool;
    return filtered.sort((a, b) => a.localeCompare(b, 'ko')).slice(0, 8);
  }, [value, suggestions]);

  const selectSuggestion = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 120); }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {matches.map(s => (
            <button
              key={s}
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={e => { e.preventDefault(); clearTimeout(blurTimer.current); selectSuggestion(s); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
