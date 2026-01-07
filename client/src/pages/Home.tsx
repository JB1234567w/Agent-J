import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">GPT Researcher</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Login</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl font-black text-foreground leading-none tracking-tighter">
              Advanced Research
            </h1>
            <h2 className="text-3xl lg:text-4xl font-bold text-accent leading-tight">
              Simplified
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore deep research with an intelligent chat interface. Upload documents, annotate findings, and generate comprehensive insights with AI-powered analysis.
            </p>
          </div>

          {/* CTA */}
          {isAuthenticated ? (
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/chat">
                  Start Research
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <a href={getLoginUrl()}>
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="space-y-2 text-left">
              <h3 className="font-semibold text-foreground">Chat History</h3>
              <p className="text-sm text-muted-foreground">
                Keep track of all your research sessions with persistent history.
              </p>
            </div>
            <div className="space-y-2 text-left">
              <h3 className="font-semibold text-foreground">File Upload</h3>
              <p className="text-sm text-muted-foreground">
                Attach documents and files for comprehensive analysis.
              </p>
            </div>
            <div className="space-y-2 text-left">
              <h3 className="font-semibold text-foreground">Voice Input</h3>
              <p className="text-sm text-muted-foreground">
                Use voice commands for hands-free research queries.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
