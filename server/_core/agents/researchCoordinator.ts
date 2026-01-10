/**
 * Research Coordinator
 * Main orchestrator for the deep research process
 */

import { OrchestratorAgent } from "./orchestratorAgent";
import { SearchAgent, ExtractionAgent, FactCheckAgent } from "./workerAgents";
import { MemoryManager } from "./memoryManager";
import {
  AgentTask,
  OrchestratorState,
  ResearchArtifact,
  Citation,
} from "./types";
import { nanoid } from "nanoid";

export interface ResearchRequest {
  sessionId: number;
  userId: number;
  query: string;
  context?: Record<string, unknown>;
}

export interface ResearchResult {
  sessionId: number;
  query: string;
  report: string;
  findings: ResearchArtifact[];
  citations: Citation[];
  executionTime: number;
}

export class ResearchCoordinator {
  private orchestrator: OrchestratorAgent;
  private searchAgent: SearchAgent;
  private extractionAgent: ExtractionAgent;
  private factCheckAgent: FactCheckAgent;
  private memoryManager: MemoryManager;
  private state: OrchestratorState;

  constructor(sessionId: number, llmModel: string = "gemini-2.5-flash") {
    this.memoryManager = new MemoryManager();
    this.memoryManager.initializeMemory(sessionId);

    this.state = {
      sessionId,
      researchPlanId: nanoid(),
      activeTasks: [],
      completedTasks: [],
      findings: [],
      citations: [],
      currentPhase: "planning",
      progressPercentage: 0,
    };

    this.orchestrator = new OrchestratorAgent(this.state, llmModel);
    this.searchAgent = new SearchAgent(llmModel);
    this.extractionAgent = new ExtractionAgent(llmModel);
    this.factCheckAgent = new FactCheckAgent(llmModel);
  }

  /**
   * Execute a deep research task
   */
  async executeResearch(request: ResearchRequest): Promise<ResearchResult> {
    const startTime = Date.now();

    try {
      // Phase 1: Planning
      this.state.currentPhase = "planning";
      this.state.progressPercentage = 10;

      // Check for stale artifacts before planning new research
      const existingFindings = this.memoryManager.getMemory(request.sessionId)?.findings || [];
      const staleFindings = await this.orchestrator.verifyFreshness(existingFindings);

      if (staleFindings.length > 0) {
        console.warn(`Found ${staleFindings.length} stale findings. Re-evaluating or re-researching might be needed.`);
      }

      const plan = await this.orchestrator.planResearch(request.query, request.context || {});
      const tasks = await this.orchestrator.decomposeTasks(request.query, plan);

      // Phase 2: Searching
      this.state.currentPhase = "searching";
      this.state.progressPercentage = 30;

      const searchResults = await this.executeTasks(tasks);
      this.state.findings.push(...searchResults);

      // Update memory with findings
      this.memoryManager.updateShortTermMemory(
        request.sessionId,
        `Found ${searchResults.length} initial findings`
      );

      // Phase 3: Analyzing
      this.state.currentPhase = "analyzing";
      this.state.progressPercentage = 60;

      const analyzedFindings = await this.analyzeFindings(searchResults);
      this.state.findings.push(...analyzedFindings);

      // Phase 4: Fact-checking
      this.state.currentPhase = "synthesizing";
      this.state.progressPercentage = 80;

      const verifiedFindings = await this.verifyFindings(this.state.findings);

      // Phase 5: Synthesizing
      this.state.currentPhase = "finalizing";
      this.state.progressPercentage = 90;

      const report = await this.orchestrator.synthesizeFindings(
        verifiedFindings,
        this.state.citations
      );

      // Update memory with final findings
      this.memoryManager.updateLongTermMemory(request.sessionId, verifiedFindings);

      this.state.progressPercentage = 100;

      return {
        sessionId: request.sessionId,
        query: request.query,
        report,
        findings: verifiedFindings,
        citations: this.state.citations,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error("Research execution failed:", error);
      throw error;
    }
  }

  /**
   * Execute multiple tasks in parallel
   */
  private async executeTasks(tasks: AgentTask[]): Promise<ResearchArtifact[]> {
    const findings: ResearchArtifact[] = [];

    // Execute tasks in parallel (limit concurrency to 3)
    const batchSize = 3;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((task) => this.executeTask(task))
      );

      findings.push(...batchResults.flat());
    }

    return findings;
  }

  /**
   * Execute a single task with appropriate agent
   */
  private async executeTask(task: AgentTask): Promise<ResearchArtifact[]> {
    const findings: ResearchArtifact[] = [];

    try {
      const result = await this.searchAgent.execute(task);

      if (result.result) {
        const artifact: ResearchArtifact = {
          id: nanoid(),
          taskId: task.id,
          type: "finding",
          content: String(result.result),
          metadata: {
            taskDescription: task.description,
            executedAt: new Date(),
          },
          createdAt: new Date(),
          retrievedAt: new Date(),
        };

        findings.push(artifact);

        // Add citation
        this.state.citations.push({
          id: nanoid(),
          artifactId: artifact.id,
          source: "Research Task",
          url: "",
          accessedAt: new Date(),
        });
      }

      this.state.completedTasks.push(result);
    } catch (error) {
      console.error(`Task execution failed: ${task.id}`, error);
    }

    return findings;
  }

  /**
   * Analyze findings for deeper insights
   */
  private async analyzeFindings(findings: ResearchArtifact[]): Promise<ResearchArtifact[]> {
    const analyzed: ResearchArtifact[] = [];

    for (const finding of findings.slice(0, 5)) {
      try {
        const task: AgentTask = {
          id: nanoid(),
          agentRole: "extractor",
          description: `Analyze and extract key insights from: ${finding.content.substring(0, 100)}`,
          context: { finding },
          status: "idle",
          createdAt: new Date(),
          retrievedAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await this.extractionAgent.execute(task);

        if (result.result) {
          analyzed.push({
            id: nanoid(),
            taskId: task.id,
            type: "analysis",
            content: String(result.result),
            metadata: {
              sourceArtifactId: finding.id,
            },
            createdAt: new Date(),
            retrievedAt: new Date(),
          });
        }
      } catch (error) {
        console.error("Analysis failed:", error);
      }
    }

    return analyzed;
  }

  /**
   * Verify findings through fact-checking
   */
  private async verifyFindings(findings: ResearchArtifact[]): Promise<ResearchArtifact[]> {
    const verified: ResearchArtifact[] = [];

    for (const finding of findings.slice(0, 5)) {
      try {
        const task: AgentTask = {
          id: nanoid(),
          agentRole: "fact_checker",
          description: `Verify the accuracy of: ${finding.content.substring(0, 100)}`,
          context: { finding },
          status: "idle",
          createdAt: new Date(),
          retrievedAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await this.factCheckAgent.execute(task);

        if (result.result) {
          verified.push({
            ...finding,
            id: nanoid(),
            type: "verified",
            metadata: {
              ...finding.metadata,
              verificationResult: result.result,
            },
          });
        }
      } catch (error) {
        console.error("Verification failed:", error);
        verified.push(finding); // Include unverified findings
      }
    }

    return verified.length > 0 ? verified : findings;
  }

  /**
   * Get current research state
   */
  getState(): OrchestratorState {
    return this.state;
  }

  /**
   * Get memory for context
   */
  getMemory() {
    return this.memoryManager.getMemory(this.state.sessionId);
  }
}
