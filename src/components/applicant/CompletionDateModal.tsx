import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import DateRangePicker from '@/components/common/DateRangePicker';
import TimeSelect from '@/components/common/TimeSelect';
import { toDateStr } from '@/lib/utils';
import { AutoSendConfig } from '@/types/jobPosting';
import { StageSendRecord } from '@/types/applicant';
import { renderTemplate, hasTemplateContent, describeSendRecord, SEND_CHANNEL_LABELS } from '@/lib/messageTemplate';
import { MailCheck, RotateCcw, Send, Zap } from 'lucide-react';

/** 발송 섹션을 그리기 위한 재료. 넘기지 않으면 발송 섹션 없이 기존 날짜+메모 모달로만 동작한다. */
export interface SendContext {
  /** 해당 단계의 발송 메시지 설정(템플릿) */
  autoSend?: AutoSendConfig;
  applicantName: string;
  stageName: string;
  positionName?: string;
  /** 이 단계의 기존 발송 기록 — 있으면 "발송됨 …" 표시 + 재발송 버튼 */
  existingSend?: StageSendRecord;
  /** 상태 변경으로 열린 모달이면 true — 자동 발송이 켜진 단계는 확인 시 발송 기록을 자동 생성 */
  autoSendOnSubmit: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  stepLabel: string;
  initialData?: { startDate?: string; endDate?: string; time?: string; note?: string };
  onSubmit: (data: { startDate: string; endDate: string; time?: string; note?: string; send?: StageSendRecord }) => void;
  sendContext?: SendContext;
}

/** 상태에 hasDateInput이 켜져 있을 때 뜨는 날짜(기간)+시간(선택)+메모 입력 모달.
 * sendContext가 주어지면 하단에 해당 단계의 안내 메시지 발송 섹션(미리보기+발송 버튼)을 함께 보여준다. */
export default function CompletionDateModal({ open, onClose, stepLabel, initialData, onSubmit, sendContext }: Props) {
  const [startDate, setStartDate] = useState(initialData?.startDate || toDateStr(new Date()));
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [note, setNote] = useState(initialData?.note || '');
  /** 발송 직전 개별 수정본. null이면 "템플릿 추적 모드" — 현재 입력된 날짜·시간으로
   * 치환한 템플릿을 그대로 보여주며 날짜를 바꾸면 미리보기도 따라간다. 담당자가
   * 내용을 한 글자라도 고치면 그 시점의 값으로 고정된다(이후 날짜를 바꿔도 수정본
   * 유지). 지난 발송본(subject/body)이 있으면 처음부터 그 발송본에서 시작한다. */
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(() => {
    const prev = sendContext?.existingSend;
    return prev?.subject !== undefined || prev?.body !== undefined
      ? { subject: prev?.subject ?? '', body: prev?.body ?? '' }
      : null;
  });

  const autoSend = sendContext?.autoSend;
  const hasTemplate = hasTemplateContent(autoSend);
  const canSend = hasTemplate && (autoSend?.channels.length ?? 0) > 0;

  const vars = {
    지원자명: sendContext?.applicantName,
    전형단계명: sendContext?.stageName,
    포지션명: sendContext?.positionName,
    면접일시: endDate ? `${endDate}${time ? ` ${time}` : ''}` : undefined,
  };

  const templateSubject = renderTemplate(autoSend?.title ?? '', vars);
  const templateBody = renderTemplate(autoSend?.body ?? '', vars);
  const displaySubject = draft?.subject ?? templateSubject;
  const displayBody = draft?.body ?? templateBody;

  const buildDateMeta = () => ({ startDate, endDate, time: time || undefined, note: note || undefined });

  /** 수동 발송: 화면에 보이는(수정 반영된) 제목/본문을 그대로 발송본으로 기록.
   * 자동 발송: 템플릿 치환본이 그대로 기록된다(개별 수정 개념 없음). */
  const newSendRecord = (auto: boolean): StageSendRecord => ({
    sentAt: new Date().toISOString(),
    channels: [...(autoSend?.channels ?? [])],
    auto,
    subject: auto ? templateSubject : displaySubject,
    body: auto ? templateBody : displayBody,
  });

  const handleSubmit = () => {
    if (!endDate) return;
    const autoFires = !!sendContext?.autoSendOnSubmit && !!autoSend?.enabled && canSend;
    onSubmit({
      ...buildDateMeta(),
      send: autoFires ? newSendRecord(true) : sendContext?.existingSend,
    });
    onClose();
  };

  /** 수동 발송(재발송 포함): 입력된 날짜와 함께 발송 기록을 즉시 저장하고 닫는다. */
  const handleSend = () => {
    if (!endDate || !canSend) return;
    onSubmit({ ...buildDateMeta(), send: newSendRecord(false) });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{stepLabel} 정보 입력</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>기간</Label>
            <DateRangePicker startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
          </div>
          <div>
            <Label>시간 <span className="text-xs text-muted-foreground font-normal">(선택)</span></Label>
            <TimeSelect value={time} onChange={setTime} />
          </div>
          <div>
            <Label>메모 <span className="text-xs text-muted-foreground font-normal">(선택)</span></Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="담당자, 특이사항 등을 남기세요" rows={2} />
          </div>

          {sendContext && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="mb-0">안내 메시지 발송</Label>
                {hasTemplate && (
                  <div className="flex items-center gap-1">
                    {(autoSend?.channels ?? []).map(c => (
                      <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0">{SEND_CHANNEL_LABELS[c]}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {!hasTemplate ? (
                <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
                  이 단계에 설정된 메시지가 없습니다. 프로세스 관리에서 메시지를 설정하세요.
                </p>
              ) : (
                <>
                  {sendContext.autoSendOnSubmit && autoSend?.enabled && canSend && (
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Zap className="w-3 h-3 shrink-0" /> 자동 발송이 켜진 단계입니다. 확인 시 발송 기록이 자동 생성됩니다.
                    </p>
                  )}
                  {sendContext.existingSend && (
                    <p className="flex items-center gap-1 text-[11px] text-success">
                      <MailCheck className="w-3 h-3 shrink-0" /> {describeSendRecord(sendContext.existingSend)}
                    </p>
                  )}
                  <div className="space-y-1.5">
                    <Input
                      value={displaySubject}
                      onChange={e => setDraft({ subject: e.target.value, body: displayBody })}
                      placeholder="발송 제목"
                      className="h-8 text-xs font-medium"
                    />
                    <Textarea
                      value={displayBody}
                      onChange={e => setDraft({ subject: displaySubject, body: e.target.value })}
                      placeholder="발송 내용"
                      rows={5}
                      className="text-xs"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] text-muted-foreground">
                        이 지원자에게만 보낼 내용을 여기서 바로 고칠 수 있습니다. 템플릿 원본은 바뀌지 않습니다.
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px] text-muted-foreground shrink-0"
                        disabled={draft === null}
                        onClick={() => setDraft(null)}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" /> 템플릿으로 되돌리기
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] text-muted-foreground">
                      {!endDate
                        ? '기간을 입력하면 발송할 수 있습니다.'
                        : !canSend
                          ? '발송 채널이 설정되어 있지 않습니다.'
                          : '실제 발송 없이 발송 기록만 남습니다(프로토타입).'}
                    </p>
                    <Button type="button" variant="outline" size="sm" disabled={!endDate || !canSend} onClick={handleSend}>
                      <Send className="w-3.5 h-3.5 mr-1" /> {sendContext.existingSend ? '재발송' : '발송'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
