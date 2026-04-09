import { useGetDashboardStats, useGetMessageCounts, useGetActivity, useGetChats, useGetBotUpdates } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as ActivityIcon, MessageSquare, Users, MessageCircle, Clock, Zap } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: messageCounts, isLoading: countsLoading } = useGetMessageCounts({ days: 7 });
  const { data: activityList, isLoading: activityLoading } = useGetActivity({ limit: 10 });
  const { data: chatList, isLoading: chatsLoading } = useGetChats();
  const { data: updatesList, isLoading: updatesLoading } = useGetBotUpdates({ limit: 5 });

  const statCards = [
    {
      title: "Total Messages",
      value: stats?.totalMessages || 0,
      icon: MessageSquare,
      description: "All time messages received",
    },
    {
      title: "Today's Messages",
      value: stats?.todayMessages || 0,
      icon: ActivityIcon,
      description: "Messages received today",
    },
    {
      title: "Active Chats",
      value: stats?.totalChats || 0,
      icon: MessageCircle,
      description: "Unique chats with bot",
    },
    {
      title: "Unique Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Users who interacted",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your bot's activity and performance.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {countsLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
              ) : messageCounts?.counts && messageCounts.counts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={messageCounts.counts}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      labelFormatter={(val) => format(parseISO(val), 'MMM d, yyyy')}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                 <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLoading ? (
                <div className="text-sm text-muted-foreground">Loading activity...</div>
              ) : activityList?.activities.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent activity.</div>
              ) : (
                activityList?.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.chatTitle ? `${activity.chatTitle} • ` : ''}
                        {format(parseISO(activity.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Chats & Raw Updates */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Chat</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {chatsLoading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">Loading chats...</td>
                    </tr>
                  ) : chatList?.chats.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">No chats found.</td>
                    </tr>
                  ) : (
                    chatList?.chats.slice(0, 5).map((chat) => (
                      <tr key={chat.chatId} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{chat.title || chat.chatId}</td>
                        <td className="px-4 py-3 capitalize">{chat.type}</td>
                        <td className="px-4 py-3">{chat.messageCount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Raw Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {updatesLoading ? (
                <div className="text-sm text-muted-foreground">Loading updates...</div>
              ) : updatesList?.updates.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent updates.</div>
              ) : (
                updatesList?.updates.map((update) => (
                  <div key={update.updateId} className="text-xs font-mono bg-muted/50 p-2 rounded-md border">
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Update ID: {update.updateId}</span>
                      <span>{format(update.date * 1000, 'HH:mm:ss')}</span>
                    </div>
                    <div className="text-foreground">
                      {update.type}: {update.text || 'No text content'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
