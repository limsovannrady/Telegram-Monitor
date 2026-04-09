import { useGetChats, useSendMessage } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, Loader2 } from "lucide-react";
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
    defaultValues: { chatId: "", text: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendMessage.mutate(
      { data: values },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast({ title: "Message sent", description: "Your message was sent via the bot." });
            form.reset({ text: "", chatId: values.chatId });
            queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetActivityQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          } else {
            toast({ title: "Failed to send", variant: "destructive" });
          }
        },
        onError: () => {
          toast({ title: "Error", description: "Could not send the message.", variant: "destructive" });
        }
      }
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Send Message</h1>
        <p className="text-sm text-muted-foreground">Dispatch a message via the bot</p>
      </div>

      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold">Compose</CardTitle>
          <CardDescription className="text-xs">
            Select a chat and type your message below.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="chatId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Chat</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-chat">
                          <SelectValue placeholder="Select a chat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chatsLoading ? (
                          <div className="p-2 text-sm text-muted-foreground">Loading...</div>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here..."
                        className="min-h-[140px] resize-none"
                        data-testid="textarea-message"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={sendMessage.isPending || chatsLoading}
                data-testid="button-send"
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
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center px-4">
        Telegram limits bots to ~30 messages/sec total. Avoid sending bursts to the same chat.
      </p>
    </div>
  );
}
