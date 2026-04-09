import { Link, useLocation } from "wouter";
import { useGetBotInfo } from "@workspace/api-client-react";
import { Activity, MessageSquare, Send, Bot, Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "Messages", href: "/messages", icon: MessageSquare, showBadge: true },
  { name: "Send", href: "/send", icon: Send },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: botInfo } = useGetBotInfo();
  const { permission, unreadCount, requestPermission, markAsRead } = useNotifications();

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

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          {permission !== "granted" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={requestPermission}
              className="h-8 px-2 gap-1.5 text-xs text-muted-foreground"
              data-testid="button-enable-notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Enable alerts</span>
            </Button>
          ) : (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              data-testid="status-notifications-on"
            >
              <Bell className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Alerts on</span>
            </div>
          )}

          {/* Bot info */}
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
                    "h-1.5 w-1.5 rounded-full animate-pulse",
                    botInfo.isOnline ? "bg-green-500" : "bg-destructive"
                  )}
                />
                {botInfo.isOnline ? "Online" : "Offline"}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Notification permission banner */}
      {permission === "default" && (
        <div className="flex-shrink-0 bg-primary/5 border-b border-primary/10 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs text-foreground truncate">
              បើក notifications ដើម្បីទទួលការជូនដំណឹងពីសារថ្មី
            </p>
          </div>
          <Button
            size="sm"
            variant="default"
            onClick={requestPermission}
            className="flex-shrink-0 h-7 text-xs px-3"
            data-testid="button-allow-notifications"
          >
            Allow
          </Button>
        </div>
      )}

      {/* Unread banner */}
      {unreadCount > 0 && (
        <div className="flex-shrink-0 bg-blue-500/10 border-b border-blue-500/20 px-4 py-2 flex items-center justify-between">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
            {unreadCount} សារថ្មី{unreadCount > 1 ? "" : ""}
          </p>
          <button
            onClick={markAsRead}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium underline underline-offset-2"
            data-testid="button-mark-as-read"
          >
            Mark as read
          </button>
        </div>
      )}

      {/* Page content — scrollable, padded for bottom nav */}
      <main className="flex-1 overflow-y-auto bg-background pb-20">
        <div className="px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-stretch h-16">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const badgeCount = item.showBadge ? unreadCount : 0;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => { if (item.showBadge) markAsRead(); }}
              className={cn(
                "flex-1 relative flex flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110"
                  )}
                />
                {badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </div>
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
