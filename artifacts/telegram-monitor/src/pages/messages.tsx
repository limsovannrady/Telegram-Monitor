import { useState } from "react";
import { useGetMessages, useGetChats } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { Search, Loader2, MessageSquare } from "lucide-react";

export default function Messages() {
  const [chatIdFilter, setChatIdFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: chatList } = useGetChats();
  const { data: messagesList, isLoading } = useGetMessages({
    limit: 50,
    ...(chatIdFilter !== "all" ? { chatId: chatIdFilter } : {})
  });

  const filteredMessages = messagesList?.messages.filter(msg => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      msg.text?.toLowerCase().includes(q) ||
      msg.fromName?.toLowerCase().includes(q) ||
      msg.fromUsername?.toLowerCase().includes(q) ||
      msg.chatTitle?.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Message Log</h1>
        <p className="text-sm text-muted-foreground">All incoming messages</p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <Select value={chatIdFilter} onValueChange={setChatIdFilter}>
          <SelectTrigger className="w-[130px]" data-testid="select-chat-filter">
            <SelectValue placeholder="All Chats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chats</SelectItem>
            {chatList?.chats.map(chat => (
              <SelectItem key={chat.chatId} value={chat.chatId}>
                {chat.title || chat.chatId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Message List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <MessageSquare className="h-8 w-8 opacity-40" />
          <p className="text-sm">No messages found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMessages.map((msg) => (
            <Card key={msg.id} data-testid={`card-message-${msg.id}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <span className="text-sm font-semibold truncate block">
                      {msg.fromName || "Unknown"}
                      {msg.fromUsername && (
                        <span className="font-normal text-muted-foreground ml-1 text-xs">@{msg.fromUsername}</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.chatTitle || msg.chatId} · <span className="capitalize">{msg.chatType}</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {format(parseISO(msg.date), 'MMM d, HH:mm')}
                  </span>
                </div>
                <div className="mt-1 text-sm text-foreground">
                  {msg.messageType === 'text' ? (
                    <span>{msg.text}</span>
                  ) : (
                    <span className="italic text-muted-foreground">[{msg.messageType}]</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
