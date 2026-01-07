import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): {
  ctx: TrpcContext;
} {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("chat router", () => {
  describe("session management", () => {
    it("should create a new chat session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.createSession({
        title: "Test Research Session",
        description: "A test session for research",
      });

      expect(result).toBeDefined();
    });

    it("should list sessions for authenticated user", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Create a session first
      await caller.chat.createSession({
        title: "Session 1",
      });

      const sessions = await caller.chat.listSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });

    it("should reject session creation with empty title", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.chat.createSession({
          title: "",
        })
      ).rejects.toThrow();
    });

    it("should update session title", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.chat.createSession({
        title: "Original Title",
      });

      const sessionId = (session as any).insertId;

      await caller.chat.updateSession({
        sessionId,
        title: "Updated Title",
      });

      const updated = await caller.chat.getSession({ sessionId });
      expect(updated?.title).toBe("Updated Title");
    });

    it("should delete a session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.chat.createSession({
        title: "To Delete",
      });

      const sessionId = (session as any).insertId;

      await caller.chat.deleteSession({ sessionId });

      const deleted = await caller.chat.getSession({ sessionId });
      expect(deleted).toBeUndefined();
    });
  });

  describe("message management", () => {
    let sessionId: number;

    beforeEach(async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.chat.createSession({
        title: "Test Session",
      });

      sessionId = (session as any).insertId;
    });

    it("should create a user message", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.createMessage({
        sessionId,
        role: "user",
        content: "What is artificial intelligence?",
      });

      expect(result).toBeDefined();
    });

    it("should create an assistant message", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.createMessage({
        sessionId,
        role: "assistant",
        content: "Artificial intelligence is...",
      });

      expect(result).toBeDefined();
    });

    it("should reject message with empty content", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.chat.createMessage({
          sessionId,
          role: "user",
          content: "",
        })
      ).rejects.toThrow();
    });

    it("should list messages for a session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await caller.chat.createMessage({
        sessionId,
        role: "user",
        content: "Test message 1",
      });

      await caller.chat.createMessage({
        sessionId,
        role: "assistant",
        content: "Test response 1",
      });

      const messages = await caller.chat.listMessages({ sessionId });
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThanOrEqual(2);
    });

    it("should delete a message", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const message = await caller.chat.createMessage({
        sessionId,
        role: "user",
        content: "To delete",
      });

      const messageId = (message as any).insertId;

      await caller.chat.deleteMessage({ messageId });

      const messages = await caller.chat.listMessages({ sessionId });
      const deleted = messages.find((m: any) => m.id === messageId);
      expect(deleted).toBeUndefined();
    });
  });

  describe("annotations", () => {
    let messageId: number;

    beforeEach(async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.chat.createSession({
        title: "Test Session",
      });

      const sessionId = (session as any).insertId;

      const message = await caller.chat.createMessage({
        sessionId,
        role: "assistant",
        content: "This is a test message with important information.",
      });

      messageId = (message as any).insertId;
    });

    it("should create an annotation", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.createAnnotation({
        messageId,
        highlightedText: "important information",
        note: "This is a key point",
        startOffset: 30,
        endOffset: 50,
      });

      expect(result).toBeDefined();
    });

    it("should list annotations for a message", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await caller.chat.createAnnotation({
        messageId,
        highlightedText: "test message",
        note: "First annotation",
        startOffset: 10,
        endOffset: 22,
      });

      const annotations = await caller.chat.listAnnotations({ messageId });
      expect(Array.isArray(annotations)).toBe(true);
    });

    it("should delete an annotation", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const annotation = await caller.chat.createAnnotation({
        messageId,
        highlightedText: "test",
        note: "To delete",
        startOffset: 10,
        endOffset: 14,
      });

      const annotationId = (annotation as any).insertId;

      await caller.chat.deleteAnnotation({ annotationId });

      const annotations = await caller.chat.listAnnotations({ messageId });
      const deleted = annotations.find((a: any) => a.id === annotationId);
      expect(deleted).toBeUndefined();
    });
  });
});
