import { useEffect, useState } from "react";
import { PanelGroup, Panel } from "react-resizable-panels";
import { ChatInterface, Message } from "@/components/ChatInterface";
import { ChatHistorySidebar, ChatSession } from "@/components/ChatHistorySidebar";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { nanoid } from "nanoid";

export default function Chat() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  // Initialize with demo data
  useEffect(() => {
    if (!user) return;

    // Create initial session
    const initialSessionId = nanoid();
    const demoSession: ChatSession = {
      id: initialSessionId,
      title: "New Research Session",
      createdAt: new Date(),
      messageCount: 0,
    };

    setSessions([demoSession]);
    setActiveSessionId(initialSessionId);
  }, [user]);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!activeSessionId) return;

    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: `I received your message: "${content}"\n\nThis is a demo response. In production, this would be connected to the GPT Researcher agent.\n\n**Key Points:**\n- Your query has been processed\n- Attachments: ${attachments?.length || 0} file(s) uploaded\n- Ready for advanced analysis`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleNewSession = () => {
    const newSessionId = nanoid();
    const newSession: ChatSession = {
      id: newSessionId,
      title: `Research Session ${sessions.length + 1}`,
      createdAt: new Date(),
      messageCount: 0,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setMessages([]);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    // In production, load messages for this session from database
    setMessages([]);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );
  };

  const handleAnnotate = (
    messageId: string,
    text: string,
    startOffset: number,
    endOffset: number
  ) => {
    console.log("Annotation:", { messageId, text, startOffset, endOffset });
    // In production, save annotation to database
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PanelGroup direction="horizontal" className="h-screen">
      {/* Sidebar */}
      <Panel
        defaultSize={20}
        minSize={15}
        maxSize={40}
        collapsible
        onCollapse={() => setSidebarCollapsed(true)}
        onExpand={() => setSidebarCollapsed(false)}
      >
        <ChatHistorySidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />
      </Panel>

      {/* Resizer */}
      {!sidebarCollapsed && <div className="w-1 bg-border hover:bg-accent cursor-col-resize" />}

      {/* Main Chat */}
      <Panel defaultSize={80} minSize={60}>
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onAnnotate={handleAnnotate}
          onNewSession={handleNewSession}
          onSettings={() => console.log("Settings clicked")}
        />
      </Panel>
    </PanelGroup>
  );
}
