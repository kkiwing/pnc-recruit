import { AutoSendConfig } from '@/types/jobPosting';
import { StageSendRecord } from '@/types/applicant';

/** 프로토타입 상수 — 실제 서비스 전환 시 회사/브랜드 설정에서 가져와야 한다. */
export const COMPANY_NAME = 'ACG';

export const SEND_CHANNEL_LABELS: Record<'email' | 'sms', string> = {
  email: '이메일',
  sms: '문자(SMS)',
};

/** AutoSendPanel의 변수칩과 이름이 일치해야 하는 치환 값 목록.
 * 값이 없는 변수는 치환하지 않고 토큰 그대로 남긴다(미리보기에서 담당자가
 * 미확정 항목({{면접장소}}, {{링크}} 등)을 알아볼 수 있도록). */
export interface TemplateVarValues {
  지원자명?: string;
  포지션명?: string;
  전형단계명?: string;
  면접일시?: string;
  면접장소?: string;
  링크?: string;
}

export function renderTemplate(text: string, vars: TemplateVarValues): string {
  const map: Record<string, string | undefined> = { 회사명: COMPANY_NAME, ...vars };
  return text.replace(/\{\{(.+?)\}\}/g, (token, name: string) => map[name.trim()] ?? token);
}

/** 제목·본문 중 하나라도 입력된 템플릿인지 — 발송 섹션 노출 여부의 기준. */
export function hasTemplateContent(config?: AutoSendConfig): boolean {
  return !!config && (config.title.trim() !== '' || config.body.trim() !== '');
}

/** "발송됨 2026-07-16 · 이메일" 형태의 발송 기록 표시 문자열. */
export function describeSendRecord(send: StageSendRecord): string {
  const date = send.sentAt.slice(0, 10);
  const channels = send.channels.map(c => SEND_CHANNEL_LABELS[c] ?? c).join('·');
  return `${send.auto ? '자동 발송됨' : '발송됨'} ${date}${channels ? ` · ${channels}` : ''}`;
}
