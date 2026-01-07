import { Message, Tool, ToolChoice, InvokeResult, ResponseFormat } from "./types";

export interface LLMProvider {
  /**
   * Invokes the LLM with the given messages and parameters.
   */
  invoke(params: {
    messages: Message[];
    tools?: Tool[];
    toolChoice?: ToolChoice;
    maxTokens?: number;
    responseFormat?: ResponseFormat;
    model: string;
  }): Promise<InvokeResult>;

  /**
   * Returns a list of available models for this provider.
   */
  getAvailableModels(): Promise<string[]>;
}
