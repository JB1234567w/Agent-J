# Advanced Deep Research Agent - Implementation Guide

## Overview

This guide documents the implementation of an advanced multi-agent deep research system for Agent-J. The system enables sophisticated research capabilities through coordinated AI agents that work together to gather, analyze, and synthesize information.

## Architecture

### Core Components

#### 1. **Orchestrator Agent** (`orchestratorAgent.ts`)
The central coordinator that manages the research process:
- **Task Decomposition**: Breaks complex queries into manageable sub-tasks
- **Agent Coordination**: Spawns and manages worker agents
- **Synthesis**: Aggregates findings into comprehensive reports
- **Adaptive Planning**: Adjusts strategy based on intermediate findings

#### 2. **Worker Agents** (`workerAgents.ts`)

**SearchAgent**
- Performs web searches and information gathering
- Formulates effective search queries
- Extracts relevant information from sources
- Identifies information gaps

**ExtractionAgent**
- Extracts structured data from unstructured content
- Identifies entities, relationships, and patterns
- Converts text into structured formats (JSON, tables)
- Handles ambiguity gracefully

**FactCheckAgent**
- Verifies accuracy of claims
- Identifies potential misinformation
- Cross-references information with multiple sources
- Provides confidence scores

#### 3. **Memory Manager** (`memoryManager.ts`)
Manages context across research sessions:
- **Short-term Memory**: Current research context (4000 tokens)
- **Long-term Memory**: Accumulated knowledge (16000 tokens)
- **Compression**: Automatically compresses memory when limits exceeded
- **Retrieval**: Provides relevant context for agent decisions

#### 4. **Research Coordinator** (`researchCoordinator.ts`)
Main orchestrator for the entire research flow:
- Initializes research sessions
- Executes multi-phase research process
- Manages parallel task execution
- Stores findings and citations

## Database Schema

### New Tables

**research_plans**
- Stores research objectives and strategies
- Tracks estimated steps and progress
- Links to chat sessions

**agent_tasks**
- Records individual agent tasks
- Tracks task status and results
- Maintains parent-child relationships for sub-tasks

**research_artifacts**
- Stores findings, analyses, and verified information
- Categorizes by type (source, finding, analysis, citation, verified)
- Includes metadata for tracking

**citations**
- Maintains source attribution
- Links artifacts to their sources
- Tracks access timestamps

**research_memory**
- Stores session-specific memory
- Separates short-term and long-term memory
- Enables context persistence

## API Endpoints

### Deep Research Router (`deepResearch.ts`)

**POST `/api/deepResearch.startResearch`**
```typescript
{
  sessionId: number;
  query: string;
  context?: Record<string, unknown>;
}
```
Response:
```typescript
{
  success: boolean;
  report: string;
  findingsCount: number;
  citationsCount: number;
  executionTime: number;
}
```

**GET `/api/deepResearch.getResearchPlans`**
- Retrieves research plans for a session

**GET `/api/deepResearch.getResearchArtifacts`**
- Retrieves all findings and artifacts for a session

**GET `/api/deepResearch.getResearchMemory`**
- Retrieves session memory (short-term and long-term)

**GET `/api/deepResearch.getAgentTasks`**
- Retrieves tasks for a specific research plan

## Tools Integration

### Web Search Tool (`tools/webSearch.ts`)
- `webSearch(query, numResults)`: Perform web searches
- `fetchUrl(url)`: Extract content from URLs
- `advancedSearch(queries, numResultsPerQuery)`: Multiple parallel searches
- `filteredSearch(query, filters, numResults)`: Search with domain/date filters

### Data Extraction Tool (`tools/dataExtraction.ts`)
- `extractEntities(text, entityTypes)`: Named entity recognition
- `extractTable(text)`: Extract tabular data
- `extractKeyValues(text)`: Extract key-value pairs
- `extractRelationships(text, entities)`: Find entity relationships
- `summarizeExtraction(result)`: Summarize extraction results

### Fact-Checking Tool (`tools/factChecking.ts`)
- `verifyClaim(claim, sources)`: Verify specific claims
- `checkBias(text)`: Analyze text for bias
- `crossReferenceInfo(claim, sources)`: Cross-reference with multiple sources
- `analyzeSourceCredibility(source)`: Assess source credibility
- `identifyMisinformationPatterns(text)`: Detect misinformation patterns

## Research Flow

### Phase 1: Planning (10% progress)
1. Analyze user query
2. Generate research objectives
3. Create research strategy
4. Decompose into sub-tasks

### Phase 2: Searching (30% progress)
1. Execute search tasks in parallel
2. Gather information from multiple sources
3. Extract key findings
4. Update short-term memory

### Phase 3: Analyzing (60% progress)
1. Extract structured data from findings
2. Identify relationships and patterns
3. Generate deeper insights
4. Update memory with analysis

### Phase 4: Fact-Checking (80% progress)
1. Verify accuracy of claims
2. Identify potential biases
3. Cross-reference with multiple sources
4. Assign confidence scores

### Phase 5: Synthesizing (90% progress)
1. Aggregate all findings
2. Create comprehensive report
3. Ensure proper citations
4. Generate final output

## Integration with Existing Chat System

The deep research system integrates seamlessly with the existing chat infrastructure:

1. **Session Management**: Uses existing `chatSessions` table
2. **Message Storage**: Can store research reports as assistant messages
3. **Attachment Support**: Research artifacts can be stored as attachments
4. **User Context**: Leverages existing user authentication

## Configuration

### Token Limits
- Orchestrator: 16,384 tokens
- Workers: 8,192 tokens each
- Short-term memory: 4,000 tokens
- Long-term memory: 16,000 tokens

### Temperature Settings
- Orchestrator: 0.5 (focused planning)
- Search Agent: 0.3 (precise searching)
- Extraction Agent: 0.2 (accurate extraction)
- Fact-Check Agent: 0.2 (rigorous verification)

### Concurrency
- Maximum parallel tasks: 3
- Batch processing enabled for efficiency

## Future Enhancements

1. **Real-time Web Search Integration**
   - Integrate with Google Custom Search API
   - Add Bing Search integration
   - Support for academic databases

2. **Advanced NLP**
   - Implement proper NER models
   - Add sentiment analysis
   - Support for multiple languages

3. **Knowledge Graph**
   - Build entity relationship graphs
   - Visualize research connections
   - Enable knowledge discovery

4. **Streaming Results**
   - Real-time progress updates
   - Streaming research reports
   - Live artifact updates

5. **Caching and Optimization**
   - Cache search results
   - Reuse previous research
   - Optimize token usage

6. **Multi-modal Support**
   - Process images and PDFs
   - Extract data from tables and charts
   - Support for video transcription

## Testing

### Unit Tests
- Test individual agent execution
- Verify tool functionality
- Test memory management

### Integration Tests
- Test multi-agent coordination
- Verify end-to-end research flow
- Test database operations

### Performance Tests
- Measure token usage
- Track execution time
- Monitor memory consumption

## Troubleshooting

### Common Issues

**Agent Task Fails**
- Check LLM API connectivity
- Verify tool implementations
- Review error logs

**Memory Overflow**
- Reduce token limits
- Increase compression threshold
- Clear old sessions

**Slow Research Execution**
- Reduce number of parallel tasks
- Simplify research queries
- Optimize tool implementations

## References

- [Anthropic Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [OpenAI Deep Research](https://openai.com/index/introducing-deep-research/)
- [Multi-Agent Systems Overview](https://www.ibm.com/think/topics/multiagent-system)

## Support

For issues or questions about the implementation, refer to:
1. This implementation guide
2. Code comments and docstrings
3. Database schema documentation
4. API endpoint specifications
