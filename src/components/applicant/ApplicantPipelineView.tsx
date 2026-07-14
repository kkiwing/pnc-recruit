import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Applicant, StageRecord, getCurrentStage, getStageRecordStatus } from '@/types/applicant';
import { useApplicants } from '@/context/ApplicantContext';
import { JobPosting, Stage, getStageColorHex, getCompletionStatus } from '@/types/jobPosting';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowRightLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import CompletionDateModal from './CompletionDateModal';
import StatusBadge from '@/components/common/StatusBadge';

interface Props {
  applicants: Applicant[];
  jobPosting: JobPosting;
}

export default function ApplicantPipelineView({ applicants, jobPosting }: Props) {
  const { updateApplicant } = useApplicants();
  const navigate = useNavigate();
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const [completionModal, setCompletionModal] = useState<{ applicantId: string; stage: Stage; statusId: string; initialData?: StageRecord['meta'] } | null>(null);

  const sortedStages = [...jobPosting.stages].sort((a, b) => a.order - b.order);

  const columns = sortedStages.map(stage => ({
    stage,
    applicants: applicants.filter(a => getCurrentStage(a.stageRecords, sortedStages)?.id === stage.id),
  }));

  const setStageRecord = (applicant: Applicant, stage: Stage, statusId: string, meta?: StageRecord['meta']) => {
    const now = new Date().toISOString();
    const exists = applicant.stageRecords.some(r => r.stageId === stage.id);
    const nextRecords = exists
      ? applicant.stageRecords.map(r => r.stageId === stage.id ? { stageId: stage.id, statusId, meta, updatedAt: now } : r)
      : [...applicant.stageRecords, { stageId: stage.id, statusId, meta, updatedAt: now }];
    updateApplicant(applicant.id, { stageRecords: nextRecords });
  };

  const handleStatusChange = (applicant: Applicant, stage: Stage, statusId: string) => {
    const completionStatus = getCompletionStatus(stage);
    const isCompletionTransition = stage.completionForm !== 'none' && completionStatus?.id === statusId;
    if (isCompletionTransition) {
      setCompletionModal({ applicantId: applicant.id, stage, statusId });
      return;
    }
    setStageRecord(applicant, stage, statusId);
  };

  const moveApplicantToStage = (applicant: Applicant, targetStage: Stage) => {
    const currentStage = getCurrentStage(applicant.stageRecords, sortedStages);
    if (currentStage?.id === targetStage.id) return;
    const nextStatusId = targetStage.statuses.find(s => !s.isDefault)?.id ?? targetStage.statuses[0]?.id;
    if (!nextStatusId) return;
    handleStatusChange(applicant, targetStage, nextStatusId);
  };

  const handleCompletionSubmit = (data: { startDate: string; endDate: string; time?: string; interviewer?: string }) => {
    if (!completionModal) return;
    const applicant = applicants.find(a => a.id === completionModal.applicantId);
    if (!applicant) return;
    setStageRecord(applicant, completionModal.stage, completionModal.statusId, {
      startDate: data.startDate,
      endDate: data.endDate,
      time: data.time,
      interviewer: data.interviewer,
    });
  };

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setDragOverStageId(null);
    const applicantId = e.dataTransfer.getData('text/plain');
    const applicant = applicants.find(a => a.id === applicantId);
    if (applicant) moveApplicantToStage(applicant, stage);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map(({ stage, applicants: stageApplicants }) => (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-64 rounded-lg border bg-muted/30 transition-colors ${dragOverStageId === stage.id ? 'border-primary bg-primary/5' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOverStageId(stage.id); }}
            onDragLeave={() => setDragOverStageId(prev => prev === stage.id ? null : prev)}
            onDrop={e => handleDrop(e, stage)}
          >
            <div className="px-3 py-2.5 border-b flex items-center justify-between">
              <span className="text-sm font-medium">{stage.name}</span>
              <span className="text-xs text-muted-foreground bg-background rounded-full px-1.5 py-0.5">{stageApplicants.length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[80px]">
              {stageApplicants.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">지원자 없음</p>
              )}
              {stageApplicants.map(applicant => {
                const status = getStageRecordStatus(applicant.stageRecords, stage);
                return (
                  <div
                    key={applicant.id}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('text/plain', applicant.id)}
                    className="bg-card border rounded-md p-2.5 cursor-grab active:cursor-grabbing hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <button
                        className="text-sm font-medium text-primary hover:underline text-left"
                        onClick={() => navigate(`/applicants/${applicant.id}`)}
                      >
                        {applicant.name}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 -mt-0.5 -mr-1 shrink-0">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <ArrowRightLeft className="w-3.5 h-3.5 mr-2" /> 다른 단계로 이동
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {sortedStages.filter(s => s.id !== stage.id).map(targetStage => (
                                <DropdownMenuItem key={targetStage.id} onClick={() => moveApplicantToStage(applicant, targetStage)}>
                                  {targetStage.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{applicant.email}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-muted-foreground">{applicant.applicationDate}</span>
                      {status && (
                        <StatusBadge color={getStageColorHex(status.color)} className="text-[11px] px-1.5 py-0.5">
                          {status.name}
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {completionModal && (
        <CompletionDateModal
          open={!!completionModal}
          onClose={() => setCompletionModal(null)}
          stepLabel={completionModal.stage.name}
          isInterview={completionModal.stage.completionForm === 'interview'}
          initialData={completionModal.initialData}
          onSubmit={handleCompletionSubmit}
        />
      )}
    </>
  );
}
