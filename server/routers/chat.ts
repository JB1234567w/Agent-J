import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createChatSession,
  getChatSessionsByUserId,
  getChatSessionById,
  updateChatSession,
  deleteChatSession,
  createMessage,
  getMessagesBySessionId,
  deleteMessage,
  createAttachment,
  getAttachmentsByMessageId,
  createAnnotation,
  getAnnotationsByMessageId,
  deleteAnnotation,
} from "../db";

export const chatRouter = router({
  // Session management
  createSession: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createChatSession(ctx.user.id, input.title, input.description);
    }),

  listSessions: protectedProcedure.query(async ({ ctx }) => {
    return await getChatSessionsByUserId(ctx.user.id);
  }),

  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return await getChatSessionById(input.sessionId);
    }),

  updateSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateChatSession(input.sessionId, {
        title: input.title,
        description: input.description,
      });
    }),

  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteChatSession(input.sessionId);
    }),

  // Message management
  createMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1, "Message content is required"),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createMessage(
        input.sessionId,
        input.role,
        input.content,
        input.metadata
      );
    }),

  listMessages: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return await getMessagesBySessionId(input.sessionId);
    }),

  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteMessage(input.messageId);
    }),

  // Attachments
  createAttachment: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
        fileName: z.string(),
        fileKey: z.string(),
        fileUrl: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await createAttachment(
        input.messageId,
        input.fileName,
        input.fileKey,
        input.fileUrl,
        input.mimeType,
        input.fileSize
      );
    }),

  listAttachments: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input }) => {
      return await getAttachmentsByMessageId(input.messageId);
    }),

  // Annotations
  createAnnotation: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
        highlightedText: z.string(),
        note: z.string(),
        startOffset: z.number(),
        endOffset: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createAnnotation(
        input.messageId,
        ctx.user.id,
        input.highlightedText,
        input.note,
        input.startOffset,
        input.endOffset
      );
    }),

  listAnnotations: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input }) => {
      return await getAnnotationsByMessageId(input.messageId);
    }),

  deleteAnnotation: protectedProcedure
    .input(z.object({ annotationId: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteAnnotation(input.annotationId);
    }),
});
