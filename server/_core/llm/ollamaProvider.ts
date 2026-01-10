import { LLMProvider } from "./LLMProvider";
import { Message, InvokeResult, InvokeParams, TextContent, ImageContent } from "./types";
import { ENV } from "../env";

export class OllamaProvider implements LLMProvider {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV.ollamaApiUrl || "http://localhost:11434/api";
  }

  async invoke(params: InvokeParams): Promise<InvokeResult> {
    const {
      messages,
      model,
      maxTokens,
      responseFormat,
    } = params;

    const ollamaMessages = messages.map(msg => {
      let content = "";
      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content.map(c => {
          if (typeof c === "string") return c;
          if (c.type === "text") return (c as TextContent).text;
          if (c.type === "image_url") return `[Image: ${(c as ImageContent).image_url.url}]`;
          return "";
        }).join("\n");
      }

      return {
        role: msg.role,
        content,
      };
    });

    const payload: Record<string, unknown> = {
      model: model,
      messages: ollamaMessages,
      options: {
        num_predict: maxTokens,
      },
      format: responseFormat?.type === "json_object" ? "json" : undefined,
      stream: false,
    };

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ollama invoke failed: ${response.status} ${response.statusText} – ${errorText}`
      );
    }

    const jsonResponse = await response.json();

    const invokeResult: InvokeResult = {
      id: jsonResponse.id || `ollama-chat-${Date.now()}`,
      created: Date.now(),
      model: jsonResponse.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: jsonResponse.message.content,
          },
          finish_reason: jsonResponse.done ? "stop" : "stop",
        },
      ],
      usage: {
        prompt_tokens: jsonResponse.prompt_eval_count || 0,
        completion_tokens: jsonResponse.eval_count || 0,
        total_tokens: (jsonResponse.prompt_eval_count || 0) + (jsonResponse.eval_count || 0),
      },
    };

    return invokeResult;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch Ollama models: ${response.statusText}`);
      }
      const jsonResponse = await response.json();
      return jsonResponse.models.map((m: { name: string }) => m.name);
    } catch (error) {
      console.error("Error fetching Ollama models:", error);
      return ["llama3", "mistral", "phi3"];
    }
  }
}
