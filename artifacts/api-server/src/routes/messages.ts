import { Router, type IRouter } from "express";
import { db, messagesTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";
import { sendTelegramMessage } from "../lib/telegram";

const router: IRouter = Router();

router.get("/messages", async (req, res): Promise<void> => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : 0;
  const chatId = req.query.chatId as string | undefined;

  const conditions = chatId ? eq(messagesTable.chatId, chatId) : undefined;

  const [messages, totalResult] = await Promise.all([
    db
      .select()
      .from(messagesTable)
      .where(conditions)
      .orderBy(desc(messagesTable.date))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(messagesTable)
      .where(conditions),
  ]);

  res.json({
    messages: messages.map((m) => ({
      id: m.id,
      updateId: m.updateId,
      messageId: m.messageId,
      date: m.date.toISOString(),
      chatId: m.chatId,
      chatTitle: m.chatTitle,
      chatType: m.chatType,
      fromId: m.fromId,
      fromName: m.fromName,
      fromUsername: m.fromUsername,
      text: m.text,
      messageType: m.messageType,
      rawData: m.rawData,
      createdAt: m.createdAt.toISOString(),
    })),
    total: totalResult[0]?.count || 0,
  });
});

router.post("/messages/send", async (req, res): Promise<void> => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const result = await sendTelegramMessage(parsed.data.chatId, parsed.data.text);
    res.json({ success: true, messageId: result.message_id });
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

export default router;
