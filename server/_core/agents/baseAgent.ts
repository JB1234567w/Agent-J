/**
 * Base Agent Class
 * Provides common functionality for all agent types
 */

import { invokeLLM, Message, Tool } from "../llm";
import { getCurrentDateTime } from "./tools/timeDate";
import { AgentRole, AgentStatus, AgentTask } from "./types";

export abstract class BaseAgent {
  protected role: AgentRole;
  protected model: string;
  protected maxTokens: number = 8192;
  protected temperature: number = 0.7;
  protected systemPrompt: string = "";

  constructor(role: AgentRole, model: string = "gemini-2.5-flash") {
    this.role = role;
    this.model = model;
  }

  /**
   * Execute the agent with a given task
   */
  async execute(task: AgentTask): Promise<AgentTask> {
    try {
      task.status = "thinking";
      task.updatedAt = new Date();

      const messages = this.buildMessages(task);
      const tools = this.getTools();

      const result = await invokeLLM({
        messages,
        tools: tools.length > 0 ? tools : undefined,
        maxTokens: this.maxTokens,
        model: this.model,
      });

      const assistantMessage = result.choices[0]?.message;
      if (!assistantMessage) {
        throw new Error("No response from LLM");
      }

      // Handle tool calls if present
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        task.status = "executing";
        task.result = await this.handleToolCalls(assistantMessage.tool_calls, task);
      } else {
        task.result = assistantMessage.content;
      }

      task.status = "completed";
      task.updatedAt = new Date();
    } catch (error) {
      task.status = "failed";
      task.error = error instanceof Error ? error.message : String(error);
      task.updatedAt = new Date();
    }

    return task;
  }

  /**
   * Build messages for the LLM call
   */
  protected buildMessages(task: AgentTask): Message[] {
    const messages: Message[] = [];

    if (this.systemPrompt) {
      messages.push({
        role: "system",
        content: this.systemPrompt,
      });
    }

    messages.push({
      role: "user",
      content: this.formatTaskDescription(task),
    });

    return messages;
  }

  /**
   * Format the task description for the LLM
   */
  protected formatTaskDescription(task: AgentTask): string {
    return `Task: ${task.description}\n\nContext: ${JSON.stringify(task.context, null, 2)}`;
  }

  /**
   * Get the tools available to this agent
   */
  protected getTools(): Tool[] {
    return [
      {
        type: "function",
        function: {
          name: "getCurrentDateTime",
          description: "Get the current date and time in ISO format, along with localized date, time, timestamp, and timezone.",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
    ];
  }

  /**
   * Handle tool calls from the LLM
   */
  protected async handleToolCalls(
    toolCalls: Array<{ id: string; function: { name: string; arguments: string } }>,
    task: AgentTask
  ): Promise<unknown> {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await this.executeTool(toolCall.function.name, args);
        results.push({
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          result,
        });
      } catch (error) {
        results.push({
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * Execute a specific tool
   */
  protected async executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case "getCurrentDateTime":
        return getCurrentDateTime();
      default:
        throw new Error(`Tool ${toolName} not implemented for ${this.role}`);
    }
  }

  /**
   * Get the role of this agent
   */
  getRole(): AgentRole {
    return this.role;
  }
}
