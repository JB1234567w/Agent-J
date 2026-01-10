/**
 * Deep Research Hook
 * Provides access to deep research functionality from React components
 */

import { useState, useCallback } from "react";
import { trpc } from "../../lib/trpc";

export interface ResearchState {
  status: 'idle' | 'searching' | 'analyzing' | 'synthesizing' | 'completed' | 'failed';
  progress: number;
  result: {
    report: string;
    findings: any[];
    citations: any[];
    executionTime: number;
  } | null;
  error: string | null;
}

export function useDeepResearch() {
  const [state, setState] = useState<ResearchState>({
    status: 'idle',
    progress: 0,
    result: null,
    error: null,
  });

  const startResearchMutation = trpc.deepResearch.startResearch.useMutation();

  const startResearch = useCallback(
    async (query: string, llmModel?: string) => {
      // For demo/simplicity, we use a fixed sessionId and userId
      const sessionId = 1;
      
      setState({
        status: 'searching',
        progress: 10,
        result: null,
        error: null,
      });

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setState(prev => {
            if (prev.progress >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return {
              ...prev,
              progress: prev.progress + 5,
              status: prev.progress > 60 ? 'synthesizing' : (prev.progress > 30 ? 'analyzing' : 'searching')
            };
          });
        }, 1000);

        const result = await startResearchMutation.mutateAsync({
          sessionId,
          query,
          llmModel,
        });

        clearInterval(progressInterval);

        setState({
          status: 'completed',
          progress: 100,
          result: {
            report: result.report,
            findings: Array(result.findingsCount).fill({}),
            citations: Array(result.citationsCount).fill({}),
            executionTime: result.executionTime,
          },
          error: null,
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Research failed";
        setState({
          status: 'failed',
          progress: 0,
          result: null,
          error: errorMessage,
        });
        throw error;
      }
    },
    [startResearchMutation]
  );

  const resetResearch = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      result: null,
      error: null,
    });
  }, []);

  return {
    startResearch,
    researchState: state,
    resetResearch,
  };
}
