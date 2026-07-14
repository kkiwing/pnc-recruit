import React from 'react';
import { getContrastTextColor } from '@/lib/colorContrast';

interface Props {
  /** 배경색 (hex) — 사용자가 지정한 단계 상태 색상 */
  color: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 사용자 지정 색상 배지. 배경색만 인라인으로 받고, 텍스트 색은 WCAG 명도 대비
 * 계산(getContrastTextColor)으로 자동 선택한다 — docs/DESIGN_SYSTEM.md 6절 참고.
 */
export default function StatusBadge({ color, children, className }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${className ?? ''}`}
      style={{ backgroundColor: color, color: getContrastTextColor(color) }}
    >
      {children}
    </span>
  );
}
