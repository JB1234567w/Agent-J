import { ENV } from "../env";
import { LLMProvider } from "./LLMProvider";
import { 
  Message, 
  Tool, 
  ToolChoice, 
  InvokeResult, 
  ResponseFormat, 
  JsonSchema, 
  OutputSchema, 
  ToolChoiceExplicit, 
  InvokeParams, 
  TextContent, 
  ImageContent, 
  FileContent, 
  MessageContent,
  Role
} from "./types";

export class OpenAIProvider implements LLMProvider {
  async invoke(params: InvokeParams): Promise<InvokeResult> {
    this.assertApiKey();

    const {
      messages,
      tools,
      toolChoice,
      tool_choice,
      outputSchema,
      output_schema,
      responseFormat,
      response_format,
      model,
    } = params;

    const payload: Record<string, unknown> = {
      model: model,
      messages: messages.map(this.normalizeMessage),
    };

    if (tools && tools.length > 0) {
      payload.tools = tools;
    }

    const normalizedToolChoice = this.normalizeToolChoice(
      toolChoice || tool_choice,
      tools
    );
    if (normalizedToolChoice) {
      payload.tool_choice = normalizedToolChoice;
    }

    payload.max_tokens = params.maxTokens || 32768;
    
    const normalizedResponseFormat = this.normalizeResponseFormat({
      responseFormat,
      response_format,
      outputSchema,
      output_schema,
    });

    if (normalizedResponseFormat) {
      payload.response_format = normalizedResponseFormat;
    }

    const response = await fetch(this.resolveApiUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
      );
    }

    return (await response.json()) as InvokeResult;
  }

  async getAvailableModels(): Promise<string[]> {
    return ["gpt-4.1-mini", "gpt-4.1-nano", "gemini-2.5-flash"];
  }

  private ensureArray(value: MessageContent | MessageContent[]): MessageContent[] {
    return Array.isArray(value) ? value : [value];
  }

  private normalizeContentPart(part: MessageContent): TextContent | ImageContent | FileContent {
    if (typeof part === "string") {
      return { type: "text", text: part };
    }
    return part as TextContent | ImageContent | FileContent;
  }

  private normalizeMessage = (message: Message) => {
    const { role, name, tool_call_id } = message;

    if (role === "tool" || role === "function") {
      const content = this.ensureArray(message.content)
        .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
        .join("\n");

      return {
        role,
        name,
        tool_call_id,
        content,
      };
    }

    const contentParts = this.ensureArray(message.content).map(this.normalizeContentPart);

    if (contentParts.length === 1 && contentParts[0].type === "text") {
      return {
        role,
        name,
        content: contentParts[0].text,
      };
    }

    return {
      role,
      name,
      content: contentParts,
    };
  };

  private normalizeToolChoice(
    toolChoice: ToolChoice | undefined,
    tools: Tool[] | undefined
  ): "none" | "auto" | ToolChoiceExplicit | undefined {
    if (!toolChoice) return undefined;

    if (toolChoice === "none" || toolChoice === "auto") {
      return toolChoice;
    }

    if (toolChoice === "required") {
      if (!tools || tools.length === 0) {
        throw new Error("tool_choice 'required' was provided but no tools were configured");
      }
      return {
        type: "function",
        function: { name: tools[0].function.name },
      };
    }

    if ("name" in toolChoice) {
      return {
        type: "function",
        function: { name: toolChoice.name },
      };
    }

    return toolChoice as ToolChoiceExplicit;
  }

  private resolveApiUrl(): string {
    return ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
      ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
      : "https://forge.manus.im/v1/chat/completions";
  }

  private assertApiKey(): void {
    if (!ENV.forgeApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
  }

  private normalizeResponseFormat(params: {
    responseFormat?: ResponseFormat;
    response_format?: ResponseFormat;
    outputSchema?: OutputSchema;
    output_schema?: OutputSchema;
  }): any {
    const { responseFormat, response_format, outputSchema, output_schema } = params;
    const explicitFormat = responseFormat || response_format;
    if (explicitFormat) return explicitFormat;

    const schema = outputSchema || output_schema;
    if (!schema) return undefined;

    return {
      type: "json_schema",
      json_schema: {
        name: schema.name,
        schema: schema.schema,
        ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
      },
    };
  }
}
