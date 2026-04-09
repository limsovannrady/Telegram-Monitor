import { useState, useEffect, useRef, useCallback } from "react";
import { useGetDashboardStats, useGetActivity } from "@workspace/api-client-react";

export type NotificationPermission = "default" | "granted" | "denied";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenCount, setLastSeenCount] = useState<number | null>(null);
  const [lastActivityId, setLastActivityId] = useState<number | null>(null);
  const lastCountRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number | null>(null);
  const isFirstLoad = useRef(true);

  const { data: stats } = useGetDashboardStats({
    query: { refetchInterval: 5000 }
  } as Parameters<typeof useGetDashboardStats>[0]);

  const { data: activity } = useGetActivity(
    { limit: 1 },
    { query: { refetchInterval: 5000 } }
  );

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (permission !== "granted") return;
    try {
      const n = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "telegrambot-message",
        silent: false,
      });
      setTimeout(() => n.close(), 6000);
    } catch {
      // Notifications not supported in this context
    }
  }, [permission]);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
    if (stats?.totalMessages !== undefined) {
      lastCountRef.current = stats.totalMessages;
      setLastSeenCount(stats.totalMessages);
    }
  }, [stats?.totalMessages]);

  useEffect(() => {
    if (!stats) return;
    const total = stats.totalMessages;

    if (isFirstLoad.current) {
      lastCountRef.current = total;
      setLastSeenCount(total);
      isFirstLoad.current = false;
      return;
    }

    if (lastCountRef.current !== null && total > lastCountRef.current) {
      const newMessages = total - lastCountRef.current;
      setUnreadCount((prev) => prev + newMessages);
      lastCountRef.current = total;
    }
  }, [stats?.totalMessages]);

  useEffect(() => {
    if (!activity?.activities?.length) return;
    const latest = activity.activities[0];
    if (!latest) return;

    if (lastActivityRef.current === null) {
      lastActivityRef.current = latest.id;
      setLastActivityId(latest.id);
      return;
    }

    if (latest.id !== lastActivityRef.current && !isFirstLoad.current) {
      const from = latest.fromName || "Someone";
      const msg = latest.description || "[message]";
      const chat = latest.chatTitle || "a chat";
      sendNotification(
        `New message from ${from}`,
        `In ${chat}: ${msg}`
      );
      lastActivityRef.current = latest.id;
      setLastActivityId(latest.id);
    }
  }, [activity?.activities, sendNotification]);

  return {
    permission,
    unreadCount,
    requestPermission,
    markAsRead,
  };
}
