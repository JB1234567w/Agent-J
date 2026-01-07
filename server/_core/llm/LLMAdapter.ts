import { LLMProvider } from "./LLMProvider";
import { OpenAIProvider } from "./openaiProvider";
import { OllamaProvider } from "./ollamaProvider";
import { GoogleGeminiProvider } from "./googleGeminiProvider";
import { InvokeParams, InvokeResult } from "./types";

export class LLMAdapter {
  private providers: Map<string, LLMProvider> = new Map();

  constructor() {
    this.registerProvider("openai", new OpenAIProvider());
    this.registerProvider("ollama", new OllamaProvider());
    this.registerProvider("gemini", new GoogleGeminiProvider());
  }

  registerProvider(name: string, provider: LLMProvider) {
    this.providers.set(name, provider);
  }

  getProvider(name: string): LLMProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`LLM provider "${name}" not found.`);
    }
    return provider;
  }

  async invoke(providerName: string, params: InvokeParams): Promise<InvokeResult> {
    const provider = this.getProvider(providerName);
    return provider.invoke(params);
  }

  async getAvailableModels(providerName: string): Promise<string[]> {
    const provider = this.getProvider(providerName);
    return provider.getAvailableModels();
  }
}

export const llmAdapter = new LLMAdapter();
