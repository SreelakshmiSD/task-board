'use client';

import { useState, useEffect, useCallback } from 'react';
import { taskManagementServices, ApiStage, ApiResponse } from '../services/taskManagementServices';

interface UseStagesOptions {
  projectId?: string;
}

interface UseStagesReturn {
  stages: ApiStage[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStages = (options: UseStagesOptions = {}): UseStagesReturn => {
  const { projectId } = options;
  const [stages, setStages] = useState<ApiStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching stages from API...', projectId ? `for project ${projectId}` : 'all stages');
      const response = await taskManagementServices.getStagesList(projectId);

      if (response.status === 'success') {
        console.log('✅ Stages fetched successfully:', response.records.length);
        setStages(response.records);
      } else {
        console.log('❌ Stages API error:', response.message);
        setError(response.message);
        setStages(response.records); // Use fallback data
      }
    } catch (error) {
      console.error('❌ Error fetching stages:', error);
      setError('Failed to fetch stages');
      // Set fallback stages
      setStages([
        { id: 47, title: 'Design' },
        { id: 48, title: 'HTML' },
        { id: 49, title: 'Development' },
        { id: 51, title: 'QA' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Auto-fetch on mount and when projectId changes
  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  return {
    stages,
    loading,
    error,
    refetch: fetchStages,
  };
};

export default useStages;
