/**
 * LLM Provider Hook
 * Manages LLM provider and model selection
 */

import { useState, useCallback, useEffect } from "react";

export interface LLMProviderConfig {
  provider: "openai" | "google" | "ollama";
  model: string;
  apiKey?: string;
  apiUrl?: string;
}

const DEFAULT_MODELS: Record<string, string[]> = {
  openai: ["gpt-4.1-mini", "gpt-4.1-nano", "gemini-2.5-flash"],
  google: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
  ollama: ["llama2", "mistral", "neural-chat", "dolphin-mixtral"],
};

export const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', description: 'High-performance models via Manus Forge' },
  { id: 'google', name: 'Google Gemini', description: 'Advanced reasoning and large context' },
  { id: 'ollama', name: 'Ollama', description: 'Local models for maximum privacy' },
];

export function useLLMProvider() {
  const [config, setConfig] = useState<LLMProviderConfig>(() => {
    if (typeof window === 'undefined') return { provider: "openai", model: "gemini-2.5-flash" };
    const stored = localStorage.getItem("llmProviderConfig");
    return stored
      ? JSON.parse(stored)
      : {
          provider: "openai",
          model: "gemini-2.5-flash",
        };
  });

  // Save config to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("llmProviderConfig", JSON.stringify(config));
    }
  }, [config]);

  const setSelectedProvider = useCallback(
    (provider: "openai" | "google" | "ollama") => {
      setConfig((prev) => ({
        ...prev,
        provider,
        model: DEFAULT_MODELS[provider]?.[0] || "",
      }));
    },
    []
  );

  const setSelectedModel = useCallback((model: string) => {
    setConfig((prev) => ({
      ...prev,
      model,
    }));
  }, []);

  const setApiKey = useCallback((apiKey: string) => {
    setConfig((prev) => ({
      ...prev,
      apiKey,
    }));
  }, []);

  const setApiUrl = useCallback((apiUrl: string) => {
    setConfig((prev) => ({
      ...prev,
      apiUrl,
    }));
  }, []);

  return {
    selectedProvider: config.provider,
    setSelectedProvider,
    selectedModel: config.model,
    setSelectedModel,
    apiKey: config.apiKey || "",
    setApiKey,
    apiUrl: config.apiUrl || "",
    setApiUrl,
    availableProviders: PROVIDERS,
    currentProviderModels: DEFAULT_MODELS[config.provider] || [],
  };
}
