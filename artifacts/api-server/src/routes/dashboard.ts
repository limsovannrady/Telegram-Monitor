import { Router, type IRouter } from "express";
import { db, messagesTable } from "@workspace/db";
import { desc, sql, count, gte } from "drizzle-orm";
import { getMe } from "../lib/telegram";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalResult, chatResult, userResult, todayResult, lastMsg] = await Promise.all([
    db.select({ count: count() }).from(messagesTable),
    db.select({ count: sql<number>`count(distinct ${messagesTable.chatId})` }).from(messagesTable),
    db.select({ count: sql<number>`count(distinct ${messagesTable.fromId})` }).from(messagesTable),
    db.select({ count: count() }).from(messagesTable).where(gte(messagesTable.date, today)),
    db.select({ date: messagesTable.date }).from(messagesTable).orderBy(desc(messagesTable.date)).limit(1),
  ]);

  let botStatus = "offline";
  try {
    await getMe();
    botStatus = "online";
  } catch {
    botStatus = "offline";
  }

  res.json({
    totalMessages: totalResult[0]?.count || 0,
    totalChats: Number(chatResult[0]?.count) || 0,
    totalUsers: Number(userResult[0]?.count) || 0,
    todayMessages: todayResult[0]?.count || 0,
    botStatus,
    lastUpdateTime: lastMsg[0]?.date?.toISOString() || new Date().toISOString(),
  });
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;

  const messages = await db
    .select()
    .from(messagesTable)
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit);

  const activities = messages.map((m) => ({
    id: m.id,
    type: m.messageType,
    description: m.text ? (m.text.length > 80 ? m.text.substring(0, 80) + "..." : m.text) : `[${m.messageType}]`,
    chatTitle: m.chatTitle || "Unknown Chat",
    fromName: m.fromName || "Unknown",
    timestamp: m.createdAt.toISOString(),
  }));

  res.json({ activities });
});

router.get("/dashboard/chats", async (req, res): Promise<void> => {
  const chats = await db
    .select({
      chatId: messagesTable.chatId,
      title: sql<string>`max(${messagesTable.chatTitle})`,
      type: sql<string>`max(${messagesTable.chatType})`,
      messageCount: count(),
      lastMessageAt: sql<Date>`max(${messagesTable.date})`,
    })
    .from(messagesTable)
    .groupBy(messagesTable.chatId);

  res.json({
    chats: chats.map((c) => ({
      chatId: c.chatId,
      title: c.title || "Unknown",
      type: c.type || "unknown",
      messageCount: c.messageCount,
      lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt).toISOString() : undefined,
    })),
  });
});

router.get("/dashboard/message-counts", async (req, res): Promise<void> => {
  const days = req.query.days ? Number(req.query.days) : 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const counts = await db
    .select({
      date: sql<string>`to_char(${messagesTable.date}, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(messagesTable)
    .where(gte(messagesTable.date, since))
    .groupBy(sql`to_char(${messagesTable.date}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${messagesTable.date}, 'YYYY-MM-DD')`);

  res.json({
    counts: counts.map((c) => ({
      date: c.date,
      count: c.count,
    })),
  });
});

export default router;
