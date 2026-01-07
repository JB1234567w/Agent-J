/**
 * LLM Provider Hook
 * Manages LLM provider and model selection
 */

import { useState, useCallback, useEffect } from "react";

export interface LLMProviderConfig {
  provider: "openai" | "gemini" | "ollama";
  model: string;
  apiKey?: string;
  apiUrl?: string;
}

const DEFAULT_MODELS: Record<string, string[]> = {
  openai: ["gpt-4.1-mini", "gpt-4.1-nano", "gemini-2.5-flash"],
  gemini: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
  ollama: ["llama2", "mistral", "neural-chat", "dolphin-mixtral"],
};

export function useLLMProvider() {
  const [config, setConfig] = useState<LLMProviderConfig>(() => {
    const stored = localStorage.getItem("llmProviderConfig");
    return stored
      ? JSON.parse(stored)
      : {
          provider: "openai",
          model: "gemini-2.5-flash",
        };
  });

  const [availableModels, setAvailableModels] = useState<string[]>(
    DEFAULT_MODELS[config.provider] || []
  );

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("llmProviderConfig", JSON.stringify(config));
  }, [config]);

  const setProvider = useCallback(
    (provider: "openai" | "gemini" | "ollama") => {
      setConfig((prev) => ({
        ...prev,
        provider,
        model: DEFAULT_MODELS[provider]?.[0] || "",
      }));
      setAvailableModels(DEFAULT_MODELS[provider] || []);
    },
    []
  );

  const setModel = useCallback((model: string) => {
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
    config,
    availableModels,
    setProvider,
    setModel,
    setApiKey,
    setApiUrl,
  };
}
