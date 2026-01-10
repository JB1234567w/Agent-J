/**
 * Research Memory Manager
 * Manages short-term and long-term memory for research sessions
 */

import { ResearchMemory, ResearchArtifact } from "./types";

export class MemoryManager {
  private memories: Map<number, ResearchMemory> = new Map();
  private maxShortTermTokens: number = 4000;
  private maxLongTermTokens: number = 16000;

  /**
   * Initialize memory for a session
   */
  initializeMemory(sessionId: number): ResearchMemory {
    const memory: ResearchMemory = {
      sessionId,
      shortTermMemory: "",
      longTermMemory: "",
      findings: [],
      lastUpdated: new Date(),
    };

    this.memories.set(sessionId, memory);
    return memory;
  }

  /**
   * Get memory for a session
   */
  getMemory(sessionId: number): ResearchMemory | undefined {
    return this.memories.get(sessionId);
  }

  /**
   * Update short-term memory with current context
   */
  updateShortTermMemory(sessionId: number, context: string): void {
    const memory = this.memories.get(sessionId);
    if (!memory) return;

    // Combine with existing short-term memory
    const combined = `${memory.shortTermMemory}\n${context}`;

    // Compress if exceeds token limit
    if (this.estimateTokens(combined) > this.maxShortTermTokens) {
      memory.shortTermMemory = this.compressMemory(combined, this.maxShortTermTokens);
    } else {
      memory.shortTermMemory = combined;
    }

    memory.lastUpdated = new Date();
  }

  /**
   * Update long-term memory with important findings
   */
  updateLongTermMemory(sessionId: number, findings: ResearchArtifact[]): void {
    const memory = this.memories.get(sessionId);
    if (!memory) return;

    const findingsSummary = findings
      .map((f) => `[${f.type}] ${f.content.substring(0, 200)}...`)
      .join("\n");

    const combined = `${memory.longTermMemory}\n${findingsSummary}`;

    // Compress if exceeds token limit
    if (this.estimateTokens(combined) > this.maxLongTermTokens) {
      memory.longTermMemory = this.compressMemory(combined, this.maxLongTermTokens);
    } else {
      memory.longTermMemory = combined;
    }

    memory.lastUpdated = new Date();
  }

  /**
   * Get relevant context from memory
   */
  getRelevantContext(sessionId: number, query: string): string {
    const memory = this.memories.get(sessionId);
    if (!memory) return "";

    // Combine short-term and long-term memory
    return `Short-term context:\n${memory.shortTermMemory}\n\nLong-term findings:\n${memory.longTermMemory}`;
  }

  /**
   * Clear memory for a session
   */
  clearMemory(sessionId: number): void {
    this.memories.delete(sessionId);
  }

  /**
   * Compress memory by extracting key information
   */
  private compressMemory(memory: string, maxTokens: number): string {
    const lines = memory.split("\n");
    let compressed = "";
    let tokens = 0;

    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);
      if (tokens + lineTokens <= maxTokens) {
        compressed += line + "\n";
        tokens += lineTokens;
      } else {
        break;
      }
    }

    // Add summary if compressed
    if (compressed.length < memory.length) {
      compressed += "\n[... memory compressed ...]";
    }

    return compressed;
  }

  /**
   * Estimate token count (rough approximation)
   * In production, use actual tokenizer
   */
  private estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Summarize findings for memory
   */
  summarizeFindings(artifacts: ResearchArtifact[]): string {
    const summary = artifacts
      .slice(0, 10) // Limit to 10 most recent
      .map((artifact) => {
        const content = artifact.content.substring(0, 150);
        return `- [${artifact.type}] ${content}`;
      })
      .join("\n");

    return summary;
  }
}
