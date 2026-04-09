import { Link, useLocation } from "wouter";
import { useGetBotInfo, useHealthCheck } from "@workspace/api-client-react";
import { Activity, MessageSquare, Send, Bot, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: botInfo } = useGetBotInfo();
  const { data: health } = useHealthCheck();

  const isHealthy = health?.status === "ok";

  const navigation = [
    { name: "Dashboard", href: "/", icon: Activity },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Send", href: "/send", icon: Send },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Bot className="h-6 w-6 text-primary mr-3" />
          <span className="font-bold text-lg tracking-tight">TeleMon</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {isHealthy ? (
                <ShieldCheck className="h-8 w-8 text-green-500" />
              ) : (
                <ShieldAlert className="h-8 w-8 text-destructive" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                System Status
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isHealthy ? "All systems operational" : "System degraded"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center">
            {botInfo && (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{botInfo.firstName}</span>
                  <span className="text-xs text-muted-foreground">@{botInfo.username}</span>
                </div>
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-accent/50 border">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      botInfo.isOnline ? "bg-green-500" : "bg-destructive"
                    )}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {botInfo.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
