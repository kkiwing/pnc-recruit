import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  locked: boolean;
  message: string;
  children: React.ReactNode;
}

/**
 * locked가 true일 때만 children을 감싸 안내 툴팁을 보여준다. 대상이 disabled 처리된
 * 컨트롤이어도(예: 비활성화된 Select) 호버 이벤트가 이 래퍼 span에서 잡히므로
 * 정상적으로 툴팁이 뜬다 — disabled 엘리먼트 자체에 TooltipTrigger를 직접 걸면
 * 브라우저에 따라 pointer 이벤트가 씹히는 문제를 피하기 위함이다.
 */
export default function LockedTooltip({ locked, message, children }: Props) {
  if (!locked) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block">{children}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{message}</TooltipContent>
    </Tooltip>
  );
}
