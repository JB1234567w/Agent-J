import { LLMProvider } from "./LLMProvider";
import { Message, InvokeResult, InvokeParams, TextContent, ImageContent } from "./types";
import { ENV } from "../env";

export class GoogleGeminiProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ENV.googleApiKey || "";
    this.baseUrl = ENV.googleApiUrl || "https://generativelanguage.googleapis.com/v1beta";
    if (!this.apiKey) {
      throw new Error("Google API Key is not configured");
    }
  }

  async invoke(params: InvokeParams): Promise<InvokeResult> {
    const {
      messages,
      model,
      maxTokens,
    } = params;

    const geminiMessages = await Promise.all(messages.map(async msg => {
      let parts: any[] = [];
      
      if (typeof msg.content === "string") {
        parts = [{ text: msg.content }];
      } else if (Array.isArray(msg.content)) {
        parts = await Promise.all(msg.content.map(async c => {
          if (typeof c === "string") return { text: c };
          if (c.type === "text") return { text: (c as TextContent).text };
          if (c.type === "image_url") {
            const base64 = await this.fetchImageAsBase64((c as ImageContent).image_url.url);
            return { inline_data: { mime_type: "image/jpeg", data: base64 } };
          }
          return {};
        }));
      }

      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      };
    }));

    const payload: Record<string, unknown> = {
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    };

    const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini invoke failed: ${response.status} ${response.statusText} – ${errorText}`
      );
    }

    const jsonResponse = await response.json();

    const invokeResult: InvokeResult = {
      id: `gemini-chat-${Date.now()}`,
      created: Date.now(),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: jsonResponse.candidates[0].content.parts[0].text,
          },
          finish_reason: jsonResponse.promptFeedback?.blockReason ? "content_filter" : "stop",
        },
      ],
      usage: {
        prompt_tokens: jsonResponse.usageMetadata?.promptTokenCount || 0,
        completion_tokens: jsonResponse.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: (jsonResponse.usageMetadata?.promptTokenCount || 0) + (jsonResponse.usageMetadata?.candidatesTokenCount || 0),
      },
    };

    return invokeResult;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch Gemini models: ${response.statusText}`);
      }
      const jsonResponse = await response.json();
      return jsonResponse.models.map((m: { name: string }) => m.name);
    } catch (error) {
      console.error("Error fetching Gemini models:", error);
      return ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
    }
  }

  private async fetchImageAsBase64(url: string): Promise<string> {
    // In a real application, you would fetch the image from the URL and convert it to base64.
    console.warn("Image fetching and base64 conversion not fully implemented for Gemini. Using placeholder.");
    return "PLACEHOLDER_BASE64_IMAGE_DATA";
  }
}
