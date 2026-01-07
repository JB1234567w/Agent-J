import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const chatSessions = mysqlTable("chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON string for streaming info, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const attachments = mysqlTable("attachments", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

export const annotations = mysqlTable("annotations", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  highlightedText: text("highlightedText").notNull(),
  note: text("note").notNull(),
  startOffset: int("startOffset").notNull(),
  endOffset: int("endOffset").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Annotation = typeof annotations.$inferSelect;
export type InsertAnnotation = typeof annotations.$inferInsert;

export const insights = mysqlTable("insights", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  type: mysqlEnum("type", ["summary", "key_insights", "multi_perspective"]).notNull(),
  content: text("content").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;

export const exports = mysqlTable("exports", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  format: mysqlEnum("format", ["pdf", "json", "markdown"]).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Export = typeof exports.$inferSelect;
export type InsertExport = typeof exports.$inferInsert;

// Multi-Agent Research System Tables

export const researchPlans = mysqlTable("research_plans", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  query: text("query").notNull(),
  objectives: text("objectives"), // JSON array
  strategy: text("strategy").notNull(),
  estimatedSteps: int("estimatedSteps").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResearchPlan = typeof researchPlans.$inferSelect;
export type InsertResearchPlan = typeof researchPlans.$inferInsert;

export const agentTasks = mysqlTable("agent_tasks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  researchPlanId: varchar("researchPlanId", { length: 64 }).notNull(),
  parentTaskId: varchar("parentTaskId", { length: 64 }),
  agentRole: mysqlEnum("agentRole", ["orchestrator", "searcher", "extractor", "fact_checker", "synthesizer"]).notNull(),
  description: text("description").notNull(),
  context: text("context"), // JSON
  status: mysqlEnum("status", ["idle", "thinking", "executing", "waiting", "completed", "failed"]).notNull(),
  result: text("result"), // JSON
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

export const researchArtifacts = mysqlTable("research_artifacts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  taskId: varchar("taskId", { length: 64 }).notNull(),
  sessionId: int("sessionId").notNull(),
  type: mysqlEnum("type", ["source", "finding", "analysis", "citation", "verified"]).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ResearchArtifact = typeof researchArtifacts.$inferSelect;
export type InsertResearchArtifact = typeof researchArtifacts.$inferInsert;

export const citations = mysqlTable("citations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  artifactId: varchar("artifactId", { length: 64 }).notNull(),
  source: varchar("source", { length: 512 }).notNull(),
  url: text("url"),
  title: text("title"),
  accessedAt: timestamp("accessedAt").defaultNow().notNull(),
});

export type Citation = typeof citations.$inferSelect;
export type InsertCitation = typeof citations.$inferInsert;

export const researchMemory = mysqlTable("research_memory", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().unique(),
  shortTermMemory: text("shortTermMemory"),
  longTermMemory: text("longTermMemory"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type ResearchMemoryRecord = typeof researchMemory.$inferSelect;
export type InsertResearchMemory = typeof researchMemory.$inferInsert;