import { Router, type IRouter } from "express";
import { getMessages } from "../lib/store";
import { SendMessageBody } from "@workspace/api-zod";
import { sendTelegramMessage } from "../lib/telegram";

const router: IRouter = Router();

router.get("/messages", (req, res): void => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : 0;
  const chatId = req.query.chatId as string | undefined;

  const { messages, total } = getMessages({ chatId, limit, offset });

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
    total,
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
