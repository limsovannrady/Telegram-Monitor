import { useState } from "react";
import { useGetChats, useSendMessage } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMessagesQueryKey, getGetActivityQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";

const formSchema = z.object({
  chatId: z.string().min(1, "Please select a chat"),
  text: z.string().min(1, "Message cannot be empty").max(4096, "Message too long"),
});

export default function SendMessage() {
  const { data: chatList, isLoading: chatsLoading } = useGetChats();
  const sendMessage = useSendMessage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatId: "",
      text: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendMessage.mutate(
      { data: values },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast({
              title: "Message sent",
              description: "Your message was successfully sent via the bot.",
            });
            form.reset({ text: "", chatId: values.chatId });
            // Invalidate queries to refresh dashboard and messages list
            queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetActivityQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          } else {
            toast({
              title: "Error sending message",
              description: "The bot could not send the message.",
              variant: "destructive",
            });
          }
        },
        onError: (err) => {
          toast({
            title: "Error sending message",
            description: err instanceof Error ? err.message : "An unknown error occurred.",
            variant: "destructive",
          });
        }
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Send Message</h1>
        <p className="text-muted-foreground">Dispatch a message as the bot to any active chat.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>
            Messages are sent instantly. Make sure you have permission to send messages to the selected group or user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="chatId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Chat</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a chat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chatsLoading ? (
                          <div className="p-2 text-sm text-muted-foreground">Loading chats...</div>
                        ) : chatList?.chats.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No active chats found.</div>
                        ) : (
                          chatList?.chats.map((chat) => (
                            <SelectItem key={chat.chatId} value={chat.chatId}>
                              {chat.title || chat.chatId} ({chat.type})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a user, group, or channel the bot is part of.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Body</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type your message here..." 
                        className="min-h-[150px] resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Formatting is supported according to the bot's default parse mode.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={sendMessage.isPending || chatsLoading}
                  className="w-full sm:w-auto"
                >
                  {sendMessage.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Note on rate limits</AlertTitle>
        <AlertDescription>
          Telegram imposes strict rate limits on bots (typically 30 messages per second total, or 1 message per second per chat).
          Avoid sending rapid bursts to the same chat to prevent the bot from being temporarily blocked.
        </AlertDescription>
      </Alert>
    </div>
  );
}
