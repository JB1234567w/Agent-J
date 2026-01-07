import { llmAdapter } from "./LLMAdapter";
import { InvokeParams, InvokeResult, Message, Tool, ToolChoice, ResponseFormat, JsonSchema, OutputSchema } from "./types";
import { ENV } from "../env";

export { Message, Tool, ToolChoice, InvokeResult, ResponseFormat, JsonSchema, OutputSchema };

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const providerName = ENV.llmProvider || "openai"; // Default to openai
  return llmAdapter.invoke(providerName, params);
}

export async function getAvailableLLMModels(providerName?: string): Promise<string[]> {
  const selectedProvider = providerName || ENV.llmProvider || "openai";
  return llmAdapter.getAvailableModels(selectedProvider);
}
