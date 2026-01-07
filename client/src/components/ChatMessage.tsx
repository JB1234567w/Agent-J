import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  onAnnotate?: (text: string, startOffset: number, endOffset: number) => void;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isStreaming = false,
  onAnnotate,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTextSelection = () => {
    if (!onAnnotate) return;
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) return;

    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(range.commonAncestorContainer);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const start = preCaretRange.toString().length - selectedText.length;
    const end = start + selectedText.length;

    onAnnotate(selectedText, start, end);
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-4 px-4 group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2 max-w-2xl",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-lg px-4 py-3 relative group/message",
            isUser
              ? "bg-accent text-accent-foreground"
              : "bg-card text-card-foreground border border-border"
          )}
          onMouseUp={handleTextSelection}
        >
          {isUser ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <Streamdown>{content}</Streamdown>
            </div>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-2 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity",
              "p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            )}
            title="Copy message"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
              <div
                className="w-1 h-1 bg-current rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-1 h-1 bg-current rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <span>Generating response...</span>
          </div>
        )}
      </div>
    </div>
  );
}
