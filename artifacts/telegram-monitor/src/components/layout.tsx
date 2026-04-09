import { Link, useLocation } from "wouter";
import { useGetBotInfo, useHealthCheck } from "@workspace/api-client-react";
import { Activity, MessageSquare, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Send", href: "/send", icon: Send },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: botInfo } = useGetBotInfo();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Header */}
      <header className="flex-shrink-0 border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-base tracking-tight text-foreground">TeleMon</span>
        </div>

        {botInfo && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground leading-none">{botInfo.firstName}</p>
              <p className="text-[11px] text-muted-foreground leading-none mt-0.5">@{botInfo.username}</p>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium border",
                botInfo.isOnline
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              )}
              data-testid="status-bot-online"
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  botInfo.isOnline ? "bg-green-500" : "bg-destructive"
                )}
              />
              {botInfo.isOnline ? "Online" : "Offline"}
            </div>
          </div>
        )}
      </header>

      {/* Page content — scrollable, padded for bottom nav */}
      <main className="flex-1 overflow-y-auto bg-background pb-20">
        <div className="px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-stretch h-16 safe-area-pb">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="text-[11px] font-medium">{item.name}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-10 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
