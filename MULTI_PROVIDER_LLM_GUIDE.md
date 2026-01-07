# Multi-Provider LLM Implementation Guide

## Overview

This guide documents the implementation of a multi-provider LLM adapter in Agent-J that supports OpenAI, Google Gemini, and local Ollama models. This enables flexibility in choosing which LLM provider to use for research tasks.

## Architecture

### Core Components

#### 1. **LLMProvider Interface** (`LLMProvider.ts`)
Defines the contract that all LLM providers must implement:
- `invoke()`: Execute LLM inference
- `getAvailableModels()`: Retrieve available models for the provider

#### 2. **Provider Implementations**

**OpenAIProvider** (`openaiProvider.ts`)
- Supports OpenAI GPT models (GPT-4, GPT-4 Turbo, etc.)
- Uses OpenAI API via Manus Forge
- Supports tool calling and structured output
- Configuration: `BUILT_IN_FORGE_API_KEY`, `BUILT_IN_FORGE_API_URL`

**GoogleGeminiProvider** (`googleGeminiProvider.ts`)
- Supports Google Gemini models (Gemini 2.5, Gemini 2.0, etc.)
- Uses Google AI Studio API
- Supports multi-modal input (text, images)
- Configuration: `GOOGLE_API_KEY`, `GOOGLE_API_URL`

**OllamaProvider** (`ollamaProvider.ts`)
- Supports local Ollama models (Llama 2, Mistral, etc.)
- Runs completely locally without external API calls
- Ideal for privacy-sensitive applications
- Configuration: `OLLAMA_API_URL` (default: `http://localhost:11434/api`)

#### 3. **LLMAdapter** (`LLMAdapter.ts`)
Central manager for all LLM providers:
- Registers and manages provider instances
- Routes requests to appropriate provider
- Provides unified interface for agent execution

#### 4. **Unified LLM Interface** (`index.ts`)
Exports simplified functions:
- `invokeLLM()`: Execute LLM with configured provider
- `getAvailableLLMModels()`: Get models from specific provider

## Environment Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# OpenAI Configuration
BUILT_IN_FORGE_API_KEY=your-openai-api-key
BUILT_IN_FORGE_API_URL=https://forge.manus.im

# Google Gemini Configuration
GOOGLE_API_KEY=your-google-api-key
GOOGLE_API_URL=https://generativelanguage.googleapis.com/v1beta

# Ollama Configuration
OLLAMA_API_URL=http://localhost:11434/api

# Default LLM Provider (openai, gemini, or ollama)
LLM_PROVIDER=openai
```

### Updated `env.ts`

The environment configuration now includes:
```typescript
export const ENV = {
  // ... existing config ...
  googleApiKey: process.env.GOOGLE_API_KEY ?? "",
  googleApiUrl: process.env.GOOGLE_API_URL ?? "",
  ollamaApiUrl: process.env.OLLAMA_API_URL ?? "",
  llmProvider: process.env.LLM_PROVIDER ?? "openai",
};
```

## Agent Integration

All agents now support model selection:

### BaseAgent
```typescript
constructor(role: AgentRole, model: string = "gemini-2.5-flash")
```

### ResearchCoordinator
```typescript
constructor(sessionId: number, llmModel: string = "gemini-2.5-flash")
```

### Deep Research API
The `startResearch` endpoint now accepts optional `llmModel` parameter:
```typescript
{
  sessionId: number;
  query: string;
  context?: Record<string, unknown>;
  llmModel?: string; // Optional: specify which model to use
}
```

## Frontend Integration

### LLMProvider Hook (`useLLMProvider.ts`)
Manages LLM provider and model selection:
```typescript
const {
  config,           // Current provider config
  availableModels,  // Available models for current provider
  setProvider,      // Change provider
  setModel,         // Change model
  setApiKey,        // Set API key
  setApiUrl,        // Set API URL
} = useLLMProvider();
```

### LLMProviderSelector Component (`LLMProviderSelector.tsx`)
UI component for selecting LLM provider and model:
- Provider selection dropdown
- Model selection dropdown
- Provider-specific configuration inputs
- Persistent storage in localStorage

## Usage Examples

### Backend: Using Different Providers

```typescript
// Using OpenAI
const result = await invokeLLM({
  messages: [...],
  model: "gpt-4.1-mini",
});

// Using Google Gemini
const result = await invokeLLM({
  messages: [...],
  model: "gemini-2.5-flash",
});

// Using Ollama
const result = await invokeLLM({
  messages: [...],
  model: "llama2",
});
```

### Frontend: Starting Research with Specific Model

```typescript
const { startResearch } = useDeepResearch();

// Use default provider
await startResearch(sessionId, query);

// Use specific model
await startResearch(sessionId, query, undefined, "gpt-4.1-mini");
```

## Provider Comparison

| Feature | OpenAI | Gemini | Ollama |
|---------|--------|--------|--------|
| **Cost** | Paid API | Paid API | Free (Local) |
| **Setup** | API Key | API Key | Local Installation |
| **Speed** | Fast | Fast | Depends on Hardware |
| **Privacy** | Cloud | Cloud | Local |
| **Models** | GPT-4, GPT-4 Turbo | Gemini 2.5, 2.0 | Llama 2, Mistral, etc. |
| **Tool Support** | ✓ | Limited | Limited |
| **Multimodal** | ✓ | ✓ | Limited |

## Setting Up Each Provider

### OpenAI Setup

1. Get API key from https://platform.openai.com/api-keys
2. Set environment variables:
   ```bash
   BUILT_IN_FORGE_API_KEY=sk-...
   LLM_PROVIDER=openai
   ```
3. Available models: `gpt-4.1-mini`, `gpt-4.1-nano`, `gemini-2.5-flash`

### Google Gemini Setup

1. Get API key from https://ai.google.dev
2. Set environment variables:
   ```bash
   GOOGLE_API_KEY=AIza...
   LLM_PROVIDER=gemini
   ```
3. Available models: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`

### Ollama Setup

1. Install Ollama from https://ollama.com
2. Run Ollama: `ollama serve`
3. Pull a model: `ollama pull llama2`
4. Set environment variables:
   ```bash
   OLLAMA_API_URL=http://localhost:11434/api
   LLM_PROVIDER=ollama
   ```
5. Available models: `llama2`, `mistral`, `neural-chat`, `dolphin-mixtral`, etc.

## API Compatibility

### Ollama OpenAI Compatibility

Ollama supports OpenAI-compatible API endpoints. If using Ollama with OpenAI client libraries:

```bash
OLLAMA_API_URL=http://localhost:11434/v1
```

## Error Handling

Each provider includes error handling for:
- Missing API keys
- Network failures
- Invalid models
- Rate limiting
- Content filtering

## Performance Considerations

### Token Usage
- **OpenAI**: Charged per token
- **Gemini**: Charged per token
- **Ollama**: No charge (local)

### Latency
- **OpenAI**: ~500ms-2s
- **Gemini**: ~500ms-2s
- **Ollama**: Depends on hardware (1s-30s+)

### Throughput
- **OpenAI**: Rate limited by API
- **Gemini**: Rate limited by API
- **Ollama**: Limited by local hardware

## Advanced Configuration

### Custom Provider

To add a new provider, implement the `LLMProvider` interface:

```typescript
export class CustomProvider implements LLMProvider {
  async invoke(params: InvokeParams): Promise<InvokeResult> {
    // Implementation
  }

  async getAvailableModels(): Promise<string[]> {
    // Implementation
  }
}

// Register in LLMAdapter
llmAdapter.registerProvider("custom", new CustomProvider());
```

### Model-Specific Configuration

Override default settings per model:

```typescript
const agent = new SearchAgent("gpt-4.1-mini");
agent.temperature = 0.8;
agent.maxTokens = 16384;
```

## Troubleshooting

### OpenAI Issues
- **"OPENAI_API_KEY is not configured"**: Set `BUILT_IN_FORGE_API_KEY`
- **Rate limit errors**: Implement exponential backoff
- **Invalid model**: Check available models for your API tier

### Gemini Issues
- **"Google API Key is not configured"**: Set `GOOGLE_API_KEY`
- **Content filtering**: Some queries may be blocked
- **Invalid model**: Ensure model name is correct

### Ollama Issues
- **Connection refused**: Ensure Ollama is running (`ollama serve`)
- **Model not found**: Pull model first (`ollama pull llama2`)
- **Out of memory**: Use smaller models or increase system RAM
- **Slow responses**: Check system resources

## Future Enhancements

1. **Provider Fallback**: Automatically fallback to alternative provider on failure
2. **Load Balancing**: Distribute requests across multiple providers
3. **Cost Optimization**: Automatically select cheapest provider for task
4. **Provider Metrics**: Track cost, latency, and quality per provider
5. **Dynamic Model Selection**: Choose model based on task complexity
6. **Streaming Support**: Stream responses from all providers
7. **Caching**: Cache responses across providers

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Ollama Documentation](https://docs.ollama.com/)
- [Ollama GitHub Repository](https://github.com/ollama/ollama)

## Support

For issues or questions about the multi-provider LLM implementation:
1. Check the troubleshooting section above
2. Review provider-specific documentation
3. Check environment variable configuration
4. Review error logs for detailed error messages
