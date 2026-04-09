import { useState } from "react";
import { useGetMessages, useGetChats } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Search, Filter, Loader2 } from "lucide-react";

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
    const searchLower = searchQuery.toLowerCase();
    return (
      msg.text?.toLowerCase().includes(searchLower) ||
      msg.fromName?.toLowerCase().includes(searchLower) ||
      msg.fromUsername?.toLowerCase().includes(searchLower) ||
      msg.chatTitle?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Message Log</h1>
          <p className="text-muted-foreground">View and filter all incoming messages.</p>
        </div>
      </div>

      <Card className="flex-shrink-0">
        <CardContent className="p-4 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search messages, users, or chats..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-[200px]">
            <Select value={chatIdFilter} onValueChange={setChatIdFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="All Chats" />
                </div>
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
        </CardContent>
      </Card>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-sm text-left relative">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 font-medium w-[180px]">Time</th>
                <th className="px-6 py-3 font-medium w-[200px]">From</th>
                <th className="px-6 py-3 font-medium w-[200px]">Chat</th>
                <th className="px-6 py-3 font-medium">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading messages...
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No messages found.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">
                      {format(parseISO(msg.date), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium">{msg.fromName || 'Unknown'}</div>
                      {msg.fromUsername && (
                        <div className="text-xs text-muted-foreground">@{msg.fromUsername}</div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium">{msg.chatTitle || msg.chatId}</div>
                      <div className="text-xs text-muted-foreground capitalize">{msg.chatType}</div>
                    </td>
                    <td className="px-6 py-3">
                      {msg.messageType === 'text' ? (
                        <span className="text-foreground">{msg.text}</span>
                      ) : (
                        <span className="text-muted-foreground italic">[{msg.messageType}]</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
