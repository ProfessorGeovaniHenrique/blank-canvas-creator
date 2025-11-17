import { useState } from "react";
import { scanProjectStatus } from "@/services/historyUpdateService";

export interface UpdateResult {
  totalFiles: number;
  totalLOC: number;
  changes: Array<{
    type: 'new' | 'modified' | 'feature';
    description: string;
    impact?: string;
  }>;
  phaseStatus: Array<{
    name: string;
    status: 'completed' | 'in-progress' | 'planned';
  }>;
  timestamp: string;
}

export function useHistoryUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);

  const updateStatus = async () => {
    setIsUpdating(true);
    try {
      const result = await scanProjectStatus();
      setUpdateResult(result);
      
      // Salvar snapshot no localStorage
      localStorage.setItem('dev-history-snapshot', JSON.stringify(result));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateStatus,
    isUpdating,
    updateResult
  };
}
