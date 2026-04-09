import { db, messagesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { sendTelegramMessage, type TelegramUpdate } from "./telegram";
import { logger } from "./logger";

function getMessageType(update: TelegramUpdate): string {
  const msg = update.message || update.edited_message || update.channel_post || update.edited_channel_post;
  if (!msg) return "unknown";
  if (msg.text) return "text";
  if (msg.photo) return "photo";
  if (msg.document) return "document";
  if (msg.sticker) return "sticker";
  if (msg.video) return "video";
  if (msg.voice) return "voice";
  if (msg.audio) return "audio";
  return "other";
}

export async function processUpdate(update: TelegramUpdate): Promise<void> {
  const msg = update.message || update.edited_message || update.channel_post || update.edited_channel_post;
  if (!msg) return;

  try {
    await db.insert(messagesTable).values({
      updateId: update.update_id,
      messageId: msg.message_id,
      date: new Date(msg.date * 1000),
      chatId: String(msg.chat.id),
      chatTitle: msg.chat.title || msg.chat.first_name || msg.chat.username || null,
      chatType: msg.chat.type,
      fromId: msg.from ? String(msg.from.id) : null,
      fromName: msg.from?.first_name || null,
      fromUsername: msg.from?.username || null,
      text: msg.text || null,
      messageType: getMessageType(update),
      rawData: update as unknown as Record<string, unknown>,
    });
  } catch (err) {
    const dbErr = err as { code?: string };
    if (dbErr.code === "23505") {
      return;
    }
    logger.error({ err, updateId: update.update_id }, "Failed to store update");
    return;
  }

  if (update.message && !update.message.from?.is_bot) {
    try {
      const chatId = String(msg.chat.id);
      const history = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.chatId, chatId))
        .orderBy(desc(messagesTable.date))
        .limit(10);

      const historyLines = history
        .reverse()
        .map((m) => {
          const sender = m.fromName || m.fromUsername || "Unknown";
          const time = m.date.toLocaleString("km-KH", { timeZone: "Asia/Phnom_Penh" });
          const content = m.text || `[${m.messageType}]`;
          return `📌 ${sender} (${time}):\n${content}`;
        })
        .join("\n\n");

      const replyText = historyLines
        ? `📜 ប្រវត្តិសន្ទនា (${history.length} សារ):\n\n${historyLines}`
        : "📭 មិនមានប្រវត្តិសន្ទនានៅឡើយទេ។";

      await sendTelegramMessage(String(msg.chat.id), replyText);
    } catch (replyErr) {
      logger.error({ replyErr }, "Failed to send history auto-reply");
    }
  }
}
