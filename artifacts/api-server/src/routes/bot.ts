import { Router, type IRouter } from "express";
import { getMe, getUpdates, type TelegramUpdate } from "../lib/telegram";

const router: IRouter = Router();

router.get("/bot/info", async (req, res): Promise<void> => {
  try {
    const me = await getMe();
    res.json({
      id: me.id,
      isBot: me.is_bot,
      firstName: me.first_name,
      username: me.username || "",
      canJoinGroups: me.can_join_groups || false,
      canReadAllGroupMessages: me.can_read_all_group_messages || false,
      supportsInlineQueries: me.supports_inline_queries || false,
      isOnline: true,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get bot info");
    res.json({
      id: 0,
      isBot: true,
      firstName: "Unknown",
      username: "unknown",
      canJoinGroups: false,
      canReadAllGroupMessages: false,
      supportsInlineQueries: false,
      isOnline: false,
    });
  }
});

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

function getUpdateType(update: TelegramUpdate): string {
  if (update.message) return "message";
  if (update.edited_message) return "edited_message";
  if (update.channel_post) return "channel_post";
  if (update.edited_channel_post) return "edited_channel_post";
  return "unknown";
}

router.get("/bot/updates", async (req, res): Promise<void> => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : undefined;

  try {
    const updates = await getUpdates(limit, offset);

    const formatted = updates.map((u) => {
      const msg = u.message || u.edited_message || u.channel_post || u.edited_channel_post;
      return {
        updateId: u.update_id,
        messageId: msg?.message_id,
        date: msg?.date || 0,
        chatId: msg?.chat?.id,
        chatTitle: msg?.chat?.title || msg?.chat?.first_name || msg?.chat?.username || "Unknown",
        chatType: msg?.chat?.type || "unknown",
        fromId: msg?.from?.id,
        fromName: msg?.from?.first_name || "Unknown",
        fromUsername: msg?.from?.username || "",
        text: msg?.text || "",
        type: getUpdateType(u),
      };
    });

    res.json({ updates: formatted, total: formatted.length });
  } catch (err) {
    req.log.error({ err }, "Failed to get updates");
    res.json({ updates: [], total: 0 });
  }
});

export { getMessageType, getUpdateType };
export default router;
