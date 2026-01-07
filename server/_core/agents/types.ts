/**
 * Multi-Agent System Types
 * Defines the core types for orchestrator and worker agents
 */

export type AgentRole = "orchestrator" | "searcher" | "extractor" | "fact_checker" | "synthesizer";

export type AgentStatus = "idle" | "thinking" | "executing" | "waiting" | "completed" | "failed";

export interface AgentTask {
  id: string;
  parentTaskId?: string;
  agentRole: AgentRole;
  description: string;
  context: Record<string, unknown>;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
  result?: unknown;
  error?: string;
}

export interface ResearchPlan {
  id: string;
  sessionId: number;
  userId: number;
  query: string;
  objectives: string[];
  strategy: string;
  estimatedSteps: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchArtifact {
  id: string;
  taskId: string;
  type: "source" | "finding" | "analysis" | "citation";
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  retrievedAt: Date; // Timestamp when the information was retrieved
}

export interface Citation {
  id: string;
  artifactId: string;
  source: string;
  url: string;
  title?: string;
  accessedAt: Date;
}

export interface ResearchMemory {
  sessionId: number;
  shortTermMemory: string; // Current research context
  longTermMemory: string; // Accumulated knowledge
  lastUpdated: Date;
}

export interface WorkerAgentConfig {
  role: AgentRole;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

export interface OrchestratorState {
  sessionId: number;
  researchPlanId: string;
  activeTasks: AgentTask[];
  completedTasks: AgentTask[];
  findings: ResearchArtifact[];
  citations: Citation[];
  currentPhase: "planning" | "searching" | "analyzing" | "synthesizing" | "finalizing";
  progressPercentage: number;
}
