import React from 'react';
import { useLLMProvider } from '../_core/hooks/useLLMProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Brain, Zap, Cloud, Monitor, Info } from 'lucide-react';

export const LLMProviderSelector: React.FC = () => {
  const {
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    apiKey,
    setApiKey,
    availableProviders,
    currentProviderModels
  } = useLLMProvider();

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'openai': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'google': return <Cloud className="w-4 h-4 text-blue-500" />;
      case 'ollama': return <Monitor className="w-4 h-4 text-green-500" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full shadow-lg border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          LLM Configuration
        </CardTitle>
        <CardDescription>
          Select your preferred AI provider and model for research tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider" className="text-sm font-semibold">AI Provider</Label>
          <div className="grid grid-cols-1 gap-2">
            {availableProviders.map((provider) => (
              <div
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id as any)}
                className={`
                  flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedProvider === provider.id 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/30'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${selectedProvider === provider.id ? 'bg-primary/10' : 'bg-muted'}`}>
                    {getProviderIcon(provider.id)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
                {selectedProvider === provider.id && (
                  <Badge variant="default" className="bg-primary text-[10px] h-5">Active</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model" className="text-sm font-semibold">Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger id="model" className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {currentProviderModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API Key (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="apiKey" className="text-sm font-semibold">API Key (Optional)</Label>
            <Badge variant="outline" className="text-[10px] font-normal">Stored Locally</Badge>
          </div>
          <Input
            id="apiKey"
            type="password"
            placeholder={selectedProvider === 'ollama' ? 'Not required for local Ollama' : 'Enter your API key...'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={selectedProvider === 'ollama'}
            className="font-mono text-xs"
          />
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            Leave empty to use the server's default configuration.
          </p>
        </div>

        {/* Provider Info Alert */}
        <div className="bg-muted/50 p-3 rounded-lg border border-muted-foreground/10">
          <div className="flex gap-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-muted-foreground">
              {selectedProvider === 'openai' && "OpenAI provides high-performance models like GPT-4. Requires a valid API key or server configuration."}
              {selectedProvider === 'google' && "Google Gemini offers advanced reasoning and large context windows. Great for deep analysis."}
              {selectedProvider === 'ollama' && "Ollama runs models locally on your machine. Maximum privacy and no API costs, but performance depends on your hardware."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
