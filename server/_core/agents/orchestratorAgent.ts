/**
 * Orchestrator Agent
 * Coordinates the multi-agent research process
 */

import { BaseAgent } from "./baseAgent";
import { AgentTask, OrchestratorState, ResearchPlan, ResearchArtifact, Citation } from "./types";
import { Tool } from "../llm";
import { nanoid } from "nanoid";

export class OrchestratorAgent extends BaseAgent {
  private state: OrchestratorState;

  constructor(state: OrchestratorState, model: string = "gemini-2.5-flash") {
    super("orchestrator", model);
    this.state = state;
    this.maxTokens = 16384;
    this.temperature = 0.5;
    this.systemPrompt = `You are an expert research orchestrator. Your role is to:
1. **ALWAYS** begin by calling the 'getCurrentDateTime' tool to establish the current date and time. This is crucial for ensuring all subsequent research is anchored to the present and uses the most up-to-date information.
2. Analyze complex research queries
3. Break them down into manageable sub-tasks
4. Coordinate multiple specialized agents to gather and synthesize information
5. Ensure all findings are properly cited and verified
6. Synthesize findings into comprehensive reports

When planning research, consider:
- What information is needed to answer the query completely
- Which specialized agents would be best suited for each task
- How to parallelize work for efficiency
- How to verify information through multiple sources
- How to synthesize findings into coherent insights`;
  }

  /**
   * Plan the research strategy
   */
  async planResearch(query: string, context: Record<string, unknown>): Promise<ResearchPlan> {
    const planTask: AgentTask = {
      id: nanoid(),
      agentRole: "orchestrator",
      description: `Create a detailed research plan for: ${query}`,
      context: {
        query,
        ...context,
      },
      status: "idle",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.execute(planTask);

    const plan: ResearchPlan = {
      id: nanoid(),
      sessionId: this.state.sessionId,
      userId: 0, // Will be set by caller
      query,
      objectives: this.extractObjectives(result.result as string),
      strategy: result.result as string,
      estimatedSteps: this.estimateSteps(result.result as string),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return plan;
  }

  /**
   * Decompose a research query into sub-tasks
   */
  async decomposeTasks(query: string, plan: ResearchPlan): Promise<AgentTask[]> {
    const decompositionTask: AgentTask = {
      id: nanoid(),
      agentRole: "orchestrator",
      description: `Decompose this research query into specific sub-tasks: ${query}`,
      context: {
        query,
        plan: plan.strategy,
        objectives: plan.objectives,
      },
      status: "idle",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.execute(decompositionTask);
    const tasks = this.parseTasksFromResponse(result.result as string);

    return tasks;
  }

  /**
   * Synthesize findings from multiple worker agents
   */
  async synthesizeFindings(
    artifacts: ResearchArtifact[],
    citations: Citation[]
  ): Promise<string> {
    const synthesisTask: AgentTask = {
      id: nanoid(),
      agentRole: "orchestrator",
      description: "Synthesize all research findings into a comprehensive report",
      context: {
        artifacts: artifacts.map((a) => ({
          id: a.id,
          type: a.type,
          content: a.content,
        })),
        citationCount: citations.length,
      },
      status: "idle",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.execute(synthesisTask);
    return result.result as string;
  }

  /**
   * Verify the freshness of research artifacts.
   * If an artifact is older than a defined threshold, it might need re-evaluation or re-research.
   */
  async verifyFreshness(artifacts: ResearchArtifact[], freshnessThresholdHours: number = 24): Promise<ResearchArtifact[]> {
    const now = new Date();
    const staleArtifacts: ResearchArtifact[] = [];

    for (const artifact of artifacts) {
      const retrievedDate = new Date(artifact.retrievedAt);
      const hoursDiff = Math.abs(now.getTime() - retrievedDate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > freshnessThresholdHours) {
        staleArtifacts.push(artifact);
      }
    }
    return staleArtifacts;
  }

  /**
   * Evaluate if more research is needed
   */
  async evaluateCompleteness(
    query: string,
    findings: ResearchArtifact[],
    plan: ResearchPlan
  ): Promise<{ isComplete: boolean; gaps: string[] }> {
    const evaluationTask: AgentTask = {
      id: nanoid(),
      agentRole: "orchestrator",
      description: `Evaluate if we have sufficient information to answer: ${query}`,
      context: {
        query,
        plan: plan.strategy,
        objectives: plan.objectives,
        findingsCount: findings.length,
      },
      status: "idle",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.execute(evaluationTask);
    const evaluation = this.parseEvaluation(result.result as string);

    return evaluation;
  }

  /**
   * Update orchestrator state
   */
  updateState(updates: Partial<OrchestratorState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Get current state
   */
  getState(): OrchestratorState {
    return this.state;
  }

  // Helper methods

  private extractObjectives(response: string): string[] {
    // Parse objectives from the response
    const lines = response.split("\n");
    return lines
      .filter((line) => line.includes("objective") || line.includes("goal"))
      .slice(0, 5);
  }

  private estimateSteps(response: string): number {
    const steps = response.match(/step|task|phase/gi) || [];
    return Math.max(steps.length, 3);
  }

  private parseTasksFromResponse(response: string): AgentTask[] {
    const tasks: AgentTask[] = [];
    const lines = response.split("\n").filter((l) => l.trim());

    for (const line of lines) {
      if (line.match(/^\d+\.|^-|^•/)) {
        tasks.push({
          id: nanoid(),
          agentRole: "searcher",
          description: line.replace(/^\d+\.|^-|^•/, "").trim(),
          context: {},
          status: "idle",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return tasks.slice(0, 5); // Limit to 5 parallel tasks
  }

  private parseEvaluation(response: string): { isComplete: boolean; gaps: string[] } {
    const isComplete = response.toLowerCase().includes("complete") || response.toLowerCase().includes("sufficient");
    const gaps = response
      .split("\n")
      .filter((line) => line.toLowerCase().includes("gap") || line.toLowerCase().includes("missing"))
      .slice(0, 3);

    return { isComplete, gaps };
  }

  protected getTools(): Tool[] {
    return [
      {
        type: "function",
        function: {
          name: "spawn_worker_agent",
          description: "Spawn a specialized worker agent to execute a specific research task",
          parameters: {
            type: "object",
            properties: {
              agentType: {
                type: "string",
                enum: ["searcher", "extractor", "fact_checker"],
                description: "Type of worker agent to spawn",
              },
              task: {
                type: "string",
                description: "The specific task for the worker agent",
              },
            },
            required: ["agentType", "task"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "request_synthesis",
          description: "Request synthesis of findings into a report",
          parameters: {
            type: "object",
            properties: {
              findings: {
                type: "array",
                description: "List of findings to synthesize",
              },
            },
            required: ["findings"],
          },
        },
      },
    ];
  }
}
