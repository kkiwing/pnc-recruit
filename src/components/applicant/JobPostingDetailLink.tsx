import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface Props {
  jobPostingId: string;
  className?: string;
}

/** 특정 공고가 선택된 화면(지원자 목록/별도 관리/프로세스 관리)에서 공고 상세로 돌아가는 링크. */
export default function JobPostingDetailLink({ jobPostingId, className }: Props) {
  return (
    <Link
      to={`/postings/${jobPostingId}`}
      className={`inline-flex items-center gap-1 text-xs text-link hover:underline whitespace-nowrap ${className ?? ''}`}
    >
      <ExternalLink className="w-3 h-3" /> 공고 상세 보기
    </Link>
  );
}
