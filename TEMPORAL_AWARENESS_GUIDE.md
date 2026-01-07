# Temporal Awareness System Guide

## Overview

This guide documents the implementation of a Temporal Awareness system in Agent-J, ensuring that all research and analysis is anchored to the current time for maximum accuracy and relevance.

## Features

### 1. Time & Date Tool
- A dedicated tool for agents to get the current date, time, and timezone.
- Provides consistent and accurate temporal information.

### 2. Temporal Anchoring
- The Orchestrator Agent is now instructed to **always** call the `getCurrentDateTime` tool at the beginning of any research task.
- This ensures that all subsequent steps are performed with an awareness of the current time.

### 3. Freshness Verification
- Research artifacts are now timestamped with a `retrievedAt` field.
- The Orchestrator can verify the freshness of information and flag stale data for re-evaluation.

## Architecture

### Time & Date Tool (`timeDate.ts`)
- `getCurrentDateTime()`: Returns a comprehensive `DateTimeInfo` object.
- `getCurrentDate()`: Returns the current date as a string.
- `getCurrentTime()`: Returns the current time as a string.
- `getTimestamp()`: Returns the current Unix timestamp.

### Base Agent (`baseAgent.ts`)
- The `getCurrentDateTime` tool is now available to all agents by default.
- The `executeTool` method in the `BaseAgent` class handles the execution of the `getCurrentDateTime` tool.

### Orchestrator Agent (`orchestratorAgent.ts`)
- The system prompt for the Orchestrator has been updated to enforce calling `getCurrentDateTime` as the first step.
- A new `verifyFreshness` method has been added to check the age of research artifacts.

### Research Coordinator (`researchCoordinator.ts`)
- The `executeResearch` method now includes a step to verify the freshness of existing findings before starting new research.
- New research artifacts are now created with a `retrievedAt` timestamp.

## Usage

The Temporal Awareness system is integrated into the core of Agent-J and operates automatically. When a new research task is initiated, the following steps are performed:

1.  The Orchestrator Agent calls `getCurrentDateTime` to get the current time.
2.  The research plan is created with an awareness of the current time.
3.  As new information is gathered, each research artifact is timestamped.
4.  The Orchestrator can periodically check the freshness of artifacts and trigger re-research if necessary.

## Benefits

- **Up-to-date Information**: Ensures that the agent always works with the most current data available.
- **Improved Accuracy**: Reduces the risk of using outdated or irrelevant information.
- **Enhanced Reliability**: Makes the agent's research more reliable and trustworthy.
- **Proactive Re-research**: Enables the agent to proactively identify and update stale information.
