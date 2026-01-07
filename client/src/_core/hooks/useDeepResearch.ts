/**
 * Deep Research Hook
 * Provides access to deep research functionality from React components
 */

import { useState, useCallback } from "react";
import { trpc } from "../trpc";

export interface ResearchState {
  isLoading: boolean;
  progress: number;
  report: string | null;
  findingsCount: number;
  citationsCount: number;
  error: string | null;
  executionTime: number | null;
}

export function useDeepResearch() {
  const [state, setState] = useState<ResearchState>({
    isLoading: false,
    progress: 0,
    report: null,
    findingsCount: 0,
    citationsCount: 0,
    error: null,
    executionTime: null,
  });

  const startResearchMutation = trpc.deepResearch.startResearch.useMutation();
  const getResearchPlansMutation = trpc.deepResearch.getResearchPlans.useQuery;
  const getResearchArtifactsMutation = trpc.deepResearch.getResearchArtifacts.useQuery;
  const getResearchMemoryMutation = trpc.deepResearch.getResearchMemory.useQuery;

  const startResearch = useCallback(
    async (sessionId: number, query: string, context?: Record<string, unknown>) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        progress: 10,
      }));

      try {
        const result = await startResearchMutation.mutateAsync({
          sessionId,
          query,
          context,
        });

        setState((prev) => ({
          ...prev,
          isLoading: false,
          progress: 100,
          report: result.report,
          findingsCount: result.findingsCount,
          citationsCount: result.citationsCount,
          executionTime: result.executionTime,
        }));

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Research failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          progress: 0,
        }));
        throw error;
      }
    },
    [startResearchMutation]
  );

  const getResearchPlans = useCallback(
    (sessionId: number) => {
      return getResearchPlansMutation({ sessionId });
    },
    [getResearchPlansMutation]
  );

  const getResearchArtifacts = useCallback(
    (sessionId: number) => {
      return getResearchArtifactsMutation({ sessionId });
    },
    [getResearchArtifactsMutation]
  );

  const getResearchMemory = useCallback(
    (sessionId: number) => {
      return getResearchMemoryMutation({ sessionId });
    },
    [getResearchMemoryMutation]
  );

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      report: null,
      findingsCount: 0,
      citationsCount: 0,
      error: null,
      executionTime: null,
    });
  }, []);

  return {
    ...state,
    startResearch,
    getResearchPlans,
    getResearchArtifacts,
    getResearchMemory,
    resetState,
  };
}
