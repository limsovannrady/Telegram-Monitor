import { logger } from "./logger";

const TELEGRAM_API = "https://api.telegram.org";

function getToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }
  return token;
}

export async function telegramApi(method: string, params?: Record<string, unknown>): Promise<unknown> {
  const token = getToken();
  const url = `${TELEGRAM_API}/bot${token}/${method}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: params ? JSON.stringify(params) : undefined,
  });

  const data = await res.json() as { ok: boolean; result?: unknown; description?: string };

  if (!data.ok) {
    logger.error({ method, description: data.description }, "Telegram API error");
    throw new Error(`Telegram API error: ${data.description}`);
  }

  return data.result;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  first_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  photo?: unknown[];
  document?: unknown;
  sticker?: unknown;
  video?: unknown;
  voice?: unknown;
  audio?: unknown;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
}

export async function getMe(): Promise<TelegramUser> {
  return telegramApi("getMe") as Promise<TelegramUser>;
}

export async function getUpdates(limit = 50, offset?: number): Promise<TelegramUpdate[]> {
  const params: Record<string, unknown> = { limit };
  if (offset !== undefined) {
    params.offset = offset;
  }
  return telegramApi("getUpdates", params) as Promise<TelegramUpdate[]>;
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<TelegramMessage> {
  return telegramApi("sendMessage", { chat_id: chatId, text }) as Promise<TelegramMessage>;
}
