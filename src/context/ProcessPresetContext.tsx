import React, { createContext, useContext, useState, useCallback } from 'react';
import { Stage, createDefaultStages } from '@/types/jobPosting';

interface ProcessPresetContextType {
  presetStages: Stage[];
  setPresetStages: (stages: Stage[]) => void;
}

const ProcessPresetContext = createContext<ProcessPresetContextType | null>(null);

/**
 * 새 공고에 기본 적용되는 전형 프로세스 프리셋. 인메모리 상태로만 유지되며
 * 새로고침 시 createDefaultStages()로 초기화된다(프로토타입 한계, docs/decision-log.md 참고).
 */
export function ProcessPresetProvider({ children }: { children: React.ReactNode }) {
  const [presetStages, setPresetStagesState] = useState<Stage[]>(() => createDefaultStages());

  const setPresetStages = useCallback((stages: Stage[]) => {
    setPresetStagesState(stages);
  }, []);

  return (
    <ProcessPresetContext.Provider value={{ presetStages, setPresetStages }}>
      {children}
    </ProcessPresetContext.Provider>
  );
}

export function useProcessPreset() {
  const ctx = useContext(ProcessPresetContext);
  if (!ctx) throw new Error('useProcessPreset must be used within ProcessPresetProvider');
  return ctx;
}
