import React, { useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AutoSendConfig } from '@/types/jobPosting';

interface Props {
  config?: AutoSendConfig;
  onSave: (config: AutoSendConfig) => void;
}

const VARIABLES = ['{{지원자명}}', '{{회사명}}', '{{포지션명}}', '{{전형단계명}}', '{{면접일시}}', '{{면접장소}}', '{{링크}}'];

const EMPTY_CONFIG: AutoSendConfig = { enabled: false, channels: [], title: '', body: '' };

/**
 * 단계별 발송 메시지 설정 폼. 템플릿(채널/제목/본문/변수)은 자동·수동 발송이
 * 공용으로 쓰므로 토글과 무관하게 항상 노출하고, 토글은 "자동 발송 사용" 여부만
 * 담당한다(꺼져 있어도 지원자 모달에서 수동 발송은 가능).
 */
export default function AutoSendPanel({ config, onSave }: Props) {
  const [draft, setDraft] = useState<AutoSendConfig>(config ?? EMPTY_CONFIG);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const toggleChannel = (channel: 'email' | 'sms') => {
    setDraft(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const insertVariable = (variable: string) => {
    const textarea = bodyRef.current;
    if (!textarea) {
      setDraft(prev => ({ ...prev, body: prev.body + variable }));
      return;
    }
    const start = textarea.selectionStart ?? draft.body.length;
    const end = textarea.selectionEnd ?? draft.body.length;
    const nextBody = draft.body.slice(0, start) + variable + draft.body.slice(end);
    setDraft(prev => ({ ...prev, body: nextBody }));
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + variable.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="space-y-3 p-3">
      <div>
        <div className="flex items-center justify-between">
          <Label className="mb-0">자동 발송 사용</Label>
          <Switch checked={draft.enabled} onCheckedChange={enabled => setDraft(prev => ({ ...prev, enabled }))} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {draft.enabled
            ? '해당 상태로 변경 시 이 메시지가 자동 발송됩니다.'
            : '자동 발송이 꺼져 있습니다. 수동 발송만 가능합니다.'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
          <input type="checkbox" checked={draft.channels.includes('email')} onChange={() => toggleChannel('email')} />
          이메일
        </label>
        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
          <input type="checkbox" checked={draft.channels.includes('sms')} onChange={() => toggleChannel('sms')} />
          문자(SMS)
        </label>
      </div>
      <div>
        <Label className="text-xs">제목</Label>
        <Input value={draft.title} onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))} placeholder="메시지 제목" className="h-8 mt-1" />
      </div>
      <div>
        <Label className="text-xs">내용</Label>
        <Textarea
          ref={bodyRef}
          value={draft.body}
          onChange={e => setDraft(prev => ({ ...prev, body: e.target.value }))}
          placeholder="메시지 내용을 입력하세요"
          rows={4}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">변수 삽입</Label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {VARIABLES.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="text-[11px] px-2 py-0.5 rounded-full bg-accent hover:bg-accent/70 text-accent-foreground"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <Button type="button" size="sm" onClick={() => onSave(draft)}>설정 저장</Button>
      <p className="text-[11px] text-muted-foreground">실제 발송은 이뤄지지 않으며, 설정 화면만 제공됩니다.</p>
    </div>
  );
}
