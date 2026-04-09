export interface StoredMessage {
  id: number;
  updateId: number;
  messageId: number;
  date: Date;
  chatId: string;
  chatTitle: string | null;
  chatType: string;
  fromId: string | null;
  fromName: string | null;
  fromUsername: string | null;
  text: string | null;
  messageType: string;
  rawData: unknown;
  createdAt: Date;
}

const MAX_MESSAGES = 1000;
let autoId = 1;
const messages: StoredMessage[] = [];
const seenUpdateIds = new Set<number>();

export function insertMessage(data: Omit<StoredMessage, "id" | "createdAt">): StoredMessage | null {
  if (seenUpdateIds.has(data.updateId)) return null;
  seenUpdateIds.add(data.updateId);

  const msg: StoredMessage = { ...data, id: autoId++, createdAt: new Date() };
  messages.push(msg);

  if (messages.length > MAX_MESSAGES) {
    const removed = messages.splice(0, messages.length - MAX_MESSAGES);
    removed.forEach((m) => seenUpdateIds.delete(m.updateId));
  }

  return msg;
}

export function getMessages(options: {
  chatId?: string;
  limit?: number;
  offset?: number;
}): { messages: StoredMessage[]; total: number } {
  const { chatId, limit = 50, offset = 0 } = options;

  let filtered = chatId ? messages.filter((m) => m.chatId === chatId) : [...messages];
  filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    messages: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}

export function getRecentByChatId(chatId: string, limit = 10): StoredMessage[] {
  return messages
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
    .reverse();
}

export function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalMessages = messages.length;
  const totalChats = new Set(messages.map((m) => m.chatId)).size;
  const totalUsers = new Set(messages.filter((m) => m.fromId).map((m) => m.fromId)).size;
  const todayMessages = messages.filter((m) => m.date >= today).length;
  const lastMsg = messages.slice().sort((a, b) => b.date.getTime() - a.date.getTime())[0];

  return { totalMessages, totalChats, totalUsers, todayMessages, lastUpdateTime: lastMsg?.date ?? new Date() };
}

export function getActivity(limit = 20): StoredMessage[] {
  return messages
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export function getChats() {
  const chatMap = new Map<string, { title: string | null; type: string; count: number; lastDate: Date }>();

  for (const m of messages) {
    const existing = chatMap.get(m.chatId);
    if (!existing) {
      chatMap.set(m.chatId, { title: m.chatTitle, type: m.chatType, count: 1, lastDate: m.date });
    } else {
      existing.count++;
      if (m.date > existing.lastDate) existing.lastDate = m.date;
      if (m.chatTitle) existing.title = m.chatTitle;
    }
  }

  return Array.from(chatMap.entries()).map(([chatId, v]) => ({
    chatId,
    title: v.title || "Unknown",
    type: v.type,
    messageCount: v.count,
    lastMessageAt: v.lastDate.toISOString(),
  }));
}

export function getMessageCounts(days = 7): { date: string; count: number }[] {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const countMap = new Map<string, number>();
  for (const m of messages) {
    if (m.date < since) continue;
    const key = m.date.toISOString().slice(0, 10);
    countMap.set(key, (countMap.get(key) || 0) + 1);
  }

  return Array.from(countMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));
}
