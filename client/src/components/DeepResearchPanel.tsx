import React, { useState } from 'react';
import { useDeepResearch } from '../_core/hooks/useDeepResearch';
import { useLLMProvider } from '../_core/hooks/useLLMProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Search, Play, CheckCircle, AlertCircle, Loader2, FileText, Link as LinkIcon } from 'lucide-react';

export const DeepResearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const { startResearch, researchState, resetResearch } = useDeepResearch();
  const { selectedModel } = useLLMProvider();

  const handleStartResearch = async () => {
    if (!query.trim()) return;
    await startResearch(query, selectedModel);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-t-4 border-t-primary">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              Deep Research Agent
            </CardTitle>
            <CardDescription>
              Advanced multi-agent research system for comprehensive analysis
            </CardDescription>
          </div>
          {researchState.status === 'completed' && (
            <Button variant="outline" size="sm" onClick={resetResearch}>
              New Research
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter your research query (e.g., 'Latest developments in quantum computing')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={researchState.status === 'searching' || researchState.status === 'analyzing' || researchState.status === 'synthesizing'}
              className="flex-1"
            />
            <Button 
              onClick={handleStartResearch} 
              disabled={!query.trim() || researchState.status !== 'idle'}
              className="bg-primary hover:bg-primary/90"
            >
              {researchState.status === 'idle' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Research
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching...
                </>
              )}
            </Button>
          </div>

          {/* Progress Section */}
          {researchState.status !== 'idle' && researchState.status !== 'completed' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between text-sm font-medium">
                <span className="capitalize flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {researchState.status}...
                </span>
                <span>{researchState.progress}%</span>
              </div>
              <Progress value={researchState.progress} className="h-2" />
              <p className="text-xs text-muted-foreground italic">
                {researchState.status === 'searching' && "Worker agents are scouring the web for information..."}
                {researchState.status === 'analyzing' && "Extracting key insights and analyzing data..."}
                {researchState.status === 'synthesizing' && "Fact-checking and synthesizing the final report..."}
              </p>
            </div>
          )}

          {/* Error Section */}
          {researchState.error && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-3 text-destructive animate-in zoom-in-95 duration-300">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-semibold">Research Failed</p>
                <p className="text-sm opacity-90">{researchState.error}</p>
              </div>
            </div>
          )}

          {/* Results Section */}
          {researchState.status === 'completed' && researchState.result && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Research Complete</p>
                  <p className="text-sm opacity-90">Successfully synthesized findings from multiple sources.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Findings</p>
                  <p className="text-2xl font-bold text-primary">{researchState.result.findings.length}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Citations</p>
                  <p className="text-2xl font-bold text-primary">{researchState.result.citations.length}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Time</p>
                  <p className="text-2xl font-bold text-primary">{(researchState.result.executionTime / 1000).toFixed(1)}s</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Research Report
                </h3>
                <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-card">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {researchState.result.report.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {researchState.result.citations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-primary" />
                    Sources & Citations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {researchState.result.citations.map((citation, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded border bg-muted/30 text-xs truncate">
                        <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                        <span className="font-medium truncate">{citation.title || citation.source}</span>
                        {citation.url && (
                          <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-auto shrink-0">
                            View Source
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
