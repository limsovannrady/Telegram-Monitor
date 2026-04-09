import { pgTable, serial, text, integer, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  updateId: integer("update_id"),
  messageId: integer("message_id"),
  date: timestamp("date").notNull(),
  chatId: text("chat_id").notNull(),
  chatTitle: text("chat_title"),
  chatType: text("chat_type").notNull(),
  fromId: text("from_id"),
  fromName: text("from_name"),
  fromUsername: text("from_username"),
  text: text("text"),
  messageType: text("message_type").notNull(),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("messages_update_id_idx").on(table.updateId),
]);

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
