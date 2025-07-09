'use client';

import { useState, useEffect, useCallback } from 'react';
import { taskManagementServices, ApiStatus, ApiResponse } from '../services/taskManagementServices';

interface UseStatusesReturn {
  statuses: ApiStatus[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStatuses = (): UseStatusesReturn => {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching statuses from API...');
      const response = await taskManagementServices.getStatusList();

      if (response.status === 'success') {
        console.log('✅ Statuses fetched successfully:', response.records.length);
        setStatuses(response.records);
      } else {
        console.log('❌ Statuses API error:', response.message);
        setError(response.message);
        setStatuses(response.records); // Use fallback data
      }
    } catch (error) {
      console.error('❌ Error fetching statuses:', error);
      setError('Failed to fetch statuses');
      // Set fallback statuses
      setStatuses([
        { id: '1', name: 'Pending' },
        { id: '2', name: 'On-going' },
        { id: '3', name: 'Completed' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return {
    statuses,
    loading,
    error,
    refetch: fetchStatuses,
  };
};

export default useStatuses;
