import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import {
  InsertUser,
  users,
  chatSessions,
  messages,
  attachments,
  annotations,
  insights,
  exports,
  researchPlans,
  agentTasks,
  researchArtifacts,
  citations,
  researchMemory,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Chat Session Queries
export async function createChatSession(
  userId: number,
  title: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chatSessions).values({
    userId,
    title,
    description,
  });
  return result;
}

export async function getChatSessionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy((t) => t.createdAt);
}

export async function getChatSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1);
  return result[0];
}

export async function updateChatSession(
  sessionId: number,
  updates: { title?: string; description?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(chatSessions)
    .set(updates)
    .where(eq(chatSessions.id, sessionId));
}

export async function deleteChatSession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(chatSessions)
    .where(eq(chatSessions.id, sessionId));
}

// Message Queries
export async function createMessage(
  sessionId: number,
  role: "user" | "assistant",
  content: string,
  metadata?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(messages).values({
    sessionId,
    role,
    content,
    metadata,
  });
}

export async function getMessagesBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy((t) => t.createdAt);
}

export async function deleteMessage(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(messages).where(eq(messages.id, messageId));
}

// Attachment Queries
export async function createAttachment(
  messageId: number,
  fileName: string,
  fileKey: string,
  fileUrl: string,
  mimeType: string,
  fileSize: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(attachments).values({
    messageId,
    fileName,
    fileKey,
    fileUrl,
    mimeType,
    fileSize,
  });
}

export async function getAttachmentsByMessageId(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(attachments)
    .where(eq(attachments.messageId, messageId));
}

// Annotation Queries
export async function createAnnotation(
  messageId: number,
  userId: number,
  highlightedText: string,
  note: string,
  startOffset: number,
  endOffset: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(annotations).values({
    messageId,
    userId,
    highlightedText,
    note,
    startOffset,
    endOffset,
  });
}

export async function getAnnotationsByMessageId(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(annotations)
    .where(eq(annotations.messageId, messageId));
}

export async function deleteAnnotation(annotationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(annotations).where(eq(annotations.id, annotationId));
}

// Insight Queries
export async function createInsight(
  sessionId: number,
  type: "summary" | "key_insights" | "multi_perspective",
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(insights).values({
    sessionId,
    type,
    content,
  });
}

export async function getInsightsBySessionId(
  sessionId: number,
  type?: "summary" | "key_insights" | "multi_perspective"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (type) {
    return await db
      .select()
      .from(insights)
      .where(
        eq(insights.sessionId, sessionId) &&
        eq(insights.type, type)
      );
  }
  return await db
    .select()
    .from(insights)
    .where(eq(insights.sessionId, sessionId));
}

// Export Queries
export async function createExport(
  sessionId: number,
  userId: number,
  format: "pdf" | "json" | "markdown",
  fileKey: string,
  fileUrl: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(exports).values({
    sessionId,
    userId,
    format,
    fileKey,
    fileUrl,
  });
}

export async function getExportsBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(exports)
    .where(eq(exports.sessionId, sessionId))
    .orderBy((t) => t.createdAt);
}


// Research Plan Queries
export async function createResearchPlan(
  sessionId: number,
  userId: number,
  query: string,
  objectives: string[],
  strategy: string,
  estimatedSteps: number,
  id: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(researchPlans).values({
    id,
    sessionId,
    userId,
    query,
    objectives: JSON.stringify(objectives),
    strategy,
    estimatedSteps,
  });
}

export async function getResearchPlanById(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(researchPlans)
    .where(eq(researchPlans.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getResearchPlansBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(researchPlans)
    .where(eq(researchPlans.sessionId, sessionId));
}

// Agent Task Queries
export async function createAgentTask(
  id: string,
  researchPlanId: string,
  agentRole: string,
  description: string,
  context: Record<string, unknown>,
  status: string,
  parentTaskId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(agentTasks).values({
    id,
    researchPlanId,
    parentTaskId,
    agentRole: agentRole as any,
    description,
    context: JSON.stringify(context),
    status: status as any,
  });
}

export async function updateAgentTask(
  id: string,
  updates: {
    status?: string;
    result?: unknown;
    error?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, unknown> = {};
  if (updates.status) updateSet.status = updates.status;
  if (updates.result) updateSet.result = JSON.stringify(updates.result);
  if (updates.error) updateSet.error = updates.error;

  return await db
    .update(agentTasks)
    .set(updateSet)
    .where(eq(agentTasks.id, id));
}

export async function getAgentTasksByResearchPlanId(researchPlanId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(agentTasks)
    .where(eq(agentTasks.researchPlanId, researchPlanId));
}

// Research Artifact Queries
export async function createResearchArtifact(
  id: string,
  taskId: string,
  sessionId: number,
  type: string,
  content: string,
  metadata: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(researchArtifacts).values({
    id,
    taskId,
    sessionId,
    type: type as any,
    content,
    metadata: JSON.stringify(metadata),
  });
}

export async function getResearchArtifactsBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(researchArtifacts)
    .where(eq(researchArtifacts.sessionId, sessionId));
}

// Citation Queries
export async function createCitation(
  id: string,
  artifactId: string,
  source: string,
  url?: string,
  title?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(citations).values({
    id,
    artifactId,
    source,
    url,
    title,
  });
}

export async function getCitationsByArtifactId(artifactId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(citations)
    .where(eq(citations.artifactId, artifactId));
}

// Research Memory Queries
export async function createOrUpdateResearchMemory(
  sessionId: number,
  shortTermMemory: string,
  longTermMemory: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(researchMemory)
    .where(eq(researchMemory.sessionId, sessionId))
    .limit(1);

  if (existing.length > 0) {
    return await db
      .update(researchMemory)
      .set({
        shortTermMemory,
        longTermMemory,
      })
      .where(eq(researchMemory.sessionId, sessionId));
  } else {
    return await db.insert(researchMemory).values({
      sessionId,
      shortTermMemory,
      longTermMemory,
    });
  }
}

export async function getResearchMemory(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(researchMemory)
    .where(eq(researchMemory.sessionId, sessionId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}
