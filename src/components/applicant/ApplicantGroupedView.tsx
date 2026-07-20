import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicants } from '@/context/ApplicantContext';
import { Applicant, FINAL_RESULT_LOCK_MESSAGE, StageRecord, StageSendRecord, getCurrentStage, getStageRecordStatus } from '@/types/applicant';
import { JobPosting, Stage, getJobPostingStatus, getStageColorHex } from '@/types/jobPosting';
import { Clock, MailCheck, MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import StatusBadge from '@/components/common/StatusBadge';
import LockedTooltip from '@/components/common/LockedTooltip';
import { Badge } from '@/components/ui/badge';
import { describeSendRecord } from '@/lib/messageTemplate';
import CompletionDateModal from './CompletionDateModal';
import MemoModal from './MemoModal';

interface Props {
  applicants: Applicant[];
  jobPostings: JobPosting[];
}

interface Section {
  posting: JobPosting;
  applicants: Applicant[];
  pendingCount: number;
}

/** 지원자가 안내(기록 입력) 대기 상태인지 — 현재 단계 상태가 hasDateInput인데
 * 아직 meta 기록이 없는 경우. 섹션 내 정렬에서 우선순위를 매기는 기준이다. */
function needsNotice(applicant: Applicant, sortedStages: Stage[]): boolean {
  const currentStage = getCurrentStage(applicant.stageRecords, sortedStages);
  if (!currentStage) return false;
  const currentStatus = getStageRecordStatus(applicant.stageRecords, currentStage);
  const meta = applicant.stageRecords.find(r => r.stageId === currentStage.id)?.meta;
  const hasMetaInfo = !!meta && !!(meta.startDate || meta.time || meta.note || meta.send);
  return !!currentStatus?.hasDateInput && !hasMetaInfo;
}

/** 섹션 내 지원자 정렬: 1) finalResult 확정자는 맨 아래 2) 미확정자 중 안내 대기가
 * 우선, 나머지는 지원일 최신순. */
function sortSectionApplicants(applicants: Applicant[], sortedStages: Stage[]): Applicant[] {
  const rankOf = (a: Applicant) => {
    if (a.finalResult) return 2;
    return needsNotice(a, sortedStages) ? 0 : 1;
  };
  return [...applicants].sort((a, b) => {
    const diff = rankOf(a) - rankOf(b);
    if (diff !== 0) return diff;
    return b.applicationDate.localeCompare(a.applicationDate);
  });
}

function buildSections(applicants: Applicant[], jobPostings: JobPosting[]): Section[] {
  const byJob = new Map<string, Applicant[]>();
  applicants.forEach(a => {
    const list = byJob.get(a.jobPostingId) ?? [];
    list.push(a);
    byJob.set(a.jobPostingId, list);
  });

  const sections: Section[] = [];
  for (const posting of jobPostings) {
    const list = byJob.get(posting.id);
    if (!list || list.length === 0) continue;
    const sortedStages = [...posting.stages].sort((a, b) => a.order - b.order);
    sections.push({
      posting,
      applicants: sortSectionApplicants(list, sortedStages),
      pendingCount: list.filter(a => !a.finalResult).length,
    });
  }
  return sections;
}

function byDeadlineAsc(a: Section, b: Section): number {
  return (a.posting.endDate || '9999-12-31').localeCompare(b.posting.endDate || '9999-12-31');
}

export default function ApplicantGroupedView({ applicants, jobPostings }: Props) {
  const { updateApplicant } = useApplicants();
  const navigate = useNavigate();
  const [completionModal, setCompletionModal] = useState<{ applicantId: string; posting: JobPosting; stage: Stage; statusId: string; initialData?: StageRecord['meta']; readOnly?: boolean } | null>(null);
  const [memoTarget, setMemoTarget] = useState<Applicant | null>(null);

  const sections = useMemo(() => buildSections(applicants, jobPostings), [applicants, jobPostings]);
  const activeSections = sections.filter(s => getJobPostingStatus(s.posting) === '진행중').sort(byDeadlineAsc);
  const endedSections = sections.filter(s => getJobPostingStatus(s.posting) === '종료').sort(byDeadlineAsc);

  const setStageRecord = (applicant: Applicant, stage: Stage, statusId: string, meta?: StageRecord['meta']) => {
    const now = new Date().toISOString();
    const exists = applicant.stageRecords.some(r => r.stageId === stage.id);
    const nextRecords = exists
      ? applicant.stageRecords.map(r => r.stageId === stage.id ? { stageId: stage.id, statusId, meta, updatedAt: now } : r)
      : [...applicant.stageRecords, { stageId: stage.id, statusId, meta, updatedAt: now }];
    updateApplicant(applicant.id, { stageRecords: nextRecords });
  };

  const handleEditMeta = (applicant: Applicant, posting: JobPosting, stage: Stage) => {
    const status = getStageRecordStatus(applicant.stageRecords, stage);
    const record = applicant.stageRecords.find(r => r.stageId === stage.id);
    if (!status) return;
    setCompletionModal({
      applicantId: applicant.id,
      posting,
      stage,
      statusId: status.id,
      initialData: record?.meta,
      readOnly: !!applicant.finalResult,
    });
  };

  const handleCompletionSubmit = (data: { startDate: string; endDate: string; time?: string; note?: string; send?: StageSendRecord }) => {
    if (!completionModal) return;
    const applicant = applicants.find(a => a.id === completionModal.applicantId);
    if (!applicant) return;
    setStageRecord(applicant, completionModal.stage, completionModal.statusId, {
      startDate: data.startDate,
      endDate: data.endDate,
      time: data.time,
      note: data.note,
      send: data.send,
    });
  };

  const handleSaveMemo = (memo: string) => {
    if (!memoTarget) return;
    updateApplicant(memoTarget.id, { memo });
  };

  const completionApplicant = completionModal ? applicants.find(a => a.id === completionModal.applicantId) : undefined;

  if (sections.length === 0) {
    return (
      <div className="card-elevated py-16 flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">조건에 맞는 지원자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {activeSections.map(section => (
        <SectionBlock
          key={section.posting.id}
          section={section}
          navigate={navigate}
          onEditMeta={handleEditMeta}
          onEditMemo={setMemoTarget}
        />
      ))}

      {endedSections.length > 0 && (
        <Accordion type="single" collapsible className="card-elevated px-4">
          <AccordionItem value="ended" className="border-b-0">
            <AccordionTrigger className="text-sm text-muted-foreground py-3 hover:no-underline">
              종료된 공고 ({endedSections.length})
            </AccordionTrigger>
            <AccordionContent className="space-y-5 pt-1">
              {endedSections.map(section => (
                <SectionBlock
                  key={section.posting.id}
                  section={section}
                  navigate={navigate}
                  onEditMeta={handleEditMeta}
                  onEditMemo={setMemoTarget}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {completionModal && (
        <CompletionDateModal
          open={!!completionModal}
          onClose={() => setCompletionModal(null)}
          stepLabel={completionModal.stage.name}
          initialData={completionModal.initialData}
          onSubmit={handleCompletionSubmit}
          sendContext={completionApplicant && {
            autoSend: completionModal.stage.autoSend,
            applicantName: completionApplicant.name,
            stageName: completionModal.stage.name,
            positionName: completionModal.posting.field || completionModal.posting.title,
            existingSend: completionApplicant.stageRecords.find(r => r.stageId === completionModal.stage.id)?.meta?.send,
            autoSendOnSubmit: false,
          }}
          readOnly={completionModal.readOnly}
        />
      )}

      {memoTarget && (
        <MemoModal
          open={!!memoTarget}
          onClose={() => setMemoTarget(null)}
          applicantId={memoTarget.id}
          applicantName={memoTarget.name}
          memo={memoTarget.memo}
          onSave={handleSaveMemo}
        />
      )}
    </div>
  );
}

function SectionBlock({ section, navigate, onEditMeta, onEditMemo }: {
  section: Section;
  navigate: (path: string) => void;
  onEditMeta: (applicant: Applicant, posting: JobPosting, stage: Stage) => void;
  onEditMemo: (applicant: Applicant) => void;
}) {
  const { posting, applicants, pendingCount } = section;
  const status = getJobPostingStatus(posting);
  const sortedStages = [...posting.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${status === '진행중' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {status}
          </span>
          <h3 className="text-sm font-medium truncate">{posting.title}</h3>
          <span className="text-xs text-muted-foreground shrink-0">{posting.field}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
          <span>지원자 {applicants.length}명</span>
          {pendingCount > 0 && (
            <span className="bg-warning/15 text-warning-foreground px-1.5 py-0.5 rounded font-medium">처리 필요 {pendingCount}</span>
          )}
        </div>
      </div>
      <div className="divide-y">
        {applicants.map(applicant => (
          <ApplicantCard
            key={applicant.id}
            applicant={applicant}
            posting={posting}
            sortedStages={sortedStages}
            navigate={navigate}
            onEditMeta={onEditMeta}
            onEditMemo={onEditMemo}
          />
        ))}
      </div>
    </div>
  );
}

function ApplicantCard({ applicant, posting, sortedStages, navigate, onEditMeta, onEditMemo }: {
  applicant: Applicant;
  posting: JobPosting;
  sortedStages: Stage[];
  navigate: (path: string) => void;
  onEditMeta: (applicant: Applicant, posting: JobPosting, stage: Stage) => void;
  onEditMemo: (applicant: Applicant) => void;
}) {
  const locked = !!applicant.finalResult;
  const currentStage = getCurrentStage(applicant.stageRecords, sortedStages);
  const currentStatus = currentStage ? getStageRecordStatus(applicant.stageRecords, currentStage) : undefined;
  const record = currentStage ? applicant.stageRecords.find(r => r.stageId === currentStage.id) : undefined;
  const meta = record?.meta;
  const hasMetaInfo = !!meta && !!(meta.startDate || meta.time || meta.note || meta.send);
  const showClock = !!currentStatus?.hasDateInput || hasMetaInfo;
  const clockDisabled = locked && !hasMetaInfo;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-accent/40 cursor-pointer ${locked ? 'opacity-60' : ''}`}
      onClick={() => navigate(`/applicants/${applicant.id}`)}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary truncate">{applicant.name}</span>
          {locked && (
            <Badge variant={applicant.finalResult!.result === '합격' ? 'success' : 'destructive'} className="text-[11px]">
              {applicant.finalResult!.result}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate block">{applicant.email}</span>
      </div>

      {currentStage && currentStatus && (
        <StatusBadge color={getStageColorHex(currentStatus.color)} className="text-[11px] shrink-0 whitespace-nowrap">
          {currentStage.name} · {currentStatus.name}
        </StatusBadge>
      )}

      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
        {showClock && currentStage && (
          <LockedTooltip locked={clockDisabled} message={FINAL_RESULT_LOCK_MESSAGE}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={clockDisabled}
                  className={`hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed ${hasMetaInfo ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
                  onClick={() => onEditMeta(applicant, posting, currentStage)}
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs space-y-1 max-w-xs">
                {hasMetaInfo ? (
                  <>
                    {meta?.startDate && meta?.endDate && <p>기간: {meta.startDate} ~ {meta.endDate}</p>}
                    {meta?.time && <p>시간: {meta.time}</p>}
                    {meta?.note && <p>메모: {meta.note}</p>}
                    <p className="text-muted-foreground">{locked ? '클릭해서 확인 (잠금 — 열람만 가능)' : '클릭해서 수정'}</p>
                  </>
                ) : (
                  <p>클릭해서 날짜·시간·메모 입력</p>
                )}
              </TooltipContent>
            </Tooltip>
          </LockedTooltip>
        )}
        {meta?.send && (
          <Tooltip>
            <TooltipTrigger asChild>
              <MailCheck className="w-3.5 h-3.5 text-success shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs space-y-0.5 max-w-xs">
              <p>{describeSendRecord(meta.send)}</p>
              {meta.send.subject && <p className="text-muted-foreground">발송 제목: {meta.send.subject}</p>}
            </TooltipContent>
          </Tooltip>
        )}
        <button
          type="button"
          title="메모 보기/작성"
          className={`hover:text-foreground ${applicant.memo ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
          onClick={() => onEditMemo(applicant)}
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
