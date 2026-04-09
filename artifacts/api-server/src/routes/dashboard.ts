import { Router, type IRouter } from "express";
import { getStats, getActivity, getChats, getMessageCounts } from "../lib/store";
import { getMe } from "../lib/telegram";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const { totalMessages, totalChats, totalUsers, todayMessages, lastUpdateTime } = getStats();

  let botStatus = "offline";
  try {
    await getMe();
    botStatus = "online";
  } catch {
    botStatus = "offline";
  }

  res.json({
    totalMessages,
    totalChats,
    totalUsers,
    todayMessages,
    botStatus,
    lastUpdateTime: lastUpdateTime.toISOString(),
  });
});

router.get("/dashboard/activity", (req, res): void => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const activities = getActivity(limit);

  res.json({
    activities: activities.map((m) => ({
      id: m.id,
      type: m.messageType,
      description: m.text ? (m.text.length > 80 ? m.text.substring(0, 80) + "..." : m.text) : `[${m.messageType}]`,
      chatTitle: m.chatTitle || "Unknown Chat",
      fromName: m.fromName || "Unknown",
      timestamp: m.createdAt.toISOString(),
    })),
  });
});

router.get("/dashboard/chats", (req, res): void => {
  res.json({ chats: getChats() });
});

router.get("/dashboard/message-counts", (req, res): void => {
  const days = req.query.days ? Number(req.query.days) : 7;
  res.json({ counts: getMessageCounts(days) });
});

export default router;
