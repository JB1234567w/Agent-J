/**
 * Deep Research Router
 * Handles multi-agent research operations
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { ResearchCoordinator } from "../_core/agents";
import {
  createResearchPlan,
  getResearchPlansBySessionId,
  createAgentTask,
  getAgentTasksByResearchPlanId,
  createResearchArtifact,
  getResearchArtifactsBySessionId,
  createCitation,
  createOrUpdateResearchMemory,
  getResearchMemory,
} from "../db";
import { nanoid } from "nanoid";

export const deepResearchRouter = router({
  /**
   * Start a deep research session
   */
  startResearch: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        query: z.string().min(10, "Query must be at least 10 characters"),
        context: z.record(z.string(), z.unknown()).optional(),
        llmModel: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const coordinator = new ResearchCoordinator(input.sessionId, input.llmModel);

        // Create research plan in database
        const planId = nanoid();
        await createResearchPlan(
          input.sessionId,
          ctx.user.id,
          input.query,
          [],
          "Research plan created",
          0,
          planId
        );

        // Start research (this will run in background in production)
        const result = await coordinator.executeResearch({
          sessionId: input.sessionId,
          userId: ctx.user.id,
          query: input.query,
          context: input.context,
        });

        // Save findings and citations to database
        for (const artifact of result.findings) {
          await createResearchArtifact(
            artifact.id,
            artifact.taskId,
            input.sessionId,
            artifact.type,
            artifact.content,
            artifact.metadata
          );
        }

        for (const citation of result.citations) {
          await createCitation(
            citation.id,
            citation.artifactId,
            citation.source,
            citation.url,
            citation.title
          );
        }

        // Save memory
        const memory = coordinator.getMemory();
        if (memory) {
          await createOrUpdateResearchMemory(
            input.sessionId,
            memory.shortTermMemory,
            memory.longTermMemory
          );
        }

        return {
          success: true,
          report: result.report,
          findingsCount: result.findings.length,
          citationsCount: result.citations.length,
          executionTime: result.executionTime,
        };
      } catch (error) {
        console.error("Deep research failed:", error);
        throw new Error(
          error instanceof Error ? error.message : "Research execution failed"
        );
      }
    }),

  /**
   * Get research plans for a session
   */
  getResearchPlans: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return await getResearchPlansBySessionId(input.sessionId);
    }),

  /**
   * Get research artifacts for a session
   */
  getResearchArtifacts: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return await getResearchArtifactsBySessionId(input.sessionId);
    }),

  /**
   * Get research memory for a session
   */
  getResearchMemory: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return await getResearchMemory(input.sessionId);
    }),

  /**
   * Get agent tasks for a research plan
   */
  getAgentTasks: protectedProcedure
    .input(z.object({ researchPlanId: z.string() }))
    .query(async ({ input }) => {
      return await getAgentTasksByResearchPlanId(input.researchPlanId);
    }),
});
