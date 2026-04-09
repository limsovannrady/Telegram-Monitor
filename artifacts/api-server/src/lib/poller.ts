import { db, messagesTable } from "@workspace/db";
import { getUpdates, type TelegramUpdate } from "./telegram";
import { logger } from "./logger";

let lastUpdateId = 0;
let isPolling = false;
let pollInterval: ReturnType<typeof setInterval> | null = null;

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

async function pollUpdates(): Promise<void> {
  if (isPolling) return;
  isPolling = true;

  try {
    const updates = await getUpdates(100, lastUpdateId > 0 ? lastUpdateId + 1 : undefined);

    for (const update of updates) {
      const msg = update.message || update.edited_message || update.channel_post || update.edited_channel_post;
      if (!msg) continue;

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

        lastUpdateId = Math.max(lastUpdateId, update.update_id);
      } catch (err) {
        const dbErr = err as { code?: string };
        if (dbErr.code === "23505") {
          lastUpdateId = Math.max(lastUpdateId, update.update_id);
          continue;
        }
        logger.error({ err, updateId: update.update_id }, "Failed to store update");
      }
    }

    if (updates.length > 0) {
      logger.info({ count: updates.length, lastUpdateId }, "Polled updates");
    }
  } catch (err) {
    logger.error({ err }, "Polling error");
  } finally {
    isPolling = false;
  }
}

export function startPolling(intervalMs = 5000): void {
  if (pollInterval) return;

  logger.info({ intervalMs }, "Starting Telegram update polling");
  pollUpdates();
  pollInterval = setInterval(pollUpdates, intervalMs);
}

export function stopPolling(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    logger.info("Stopped Telegram update polling");
  }
}
