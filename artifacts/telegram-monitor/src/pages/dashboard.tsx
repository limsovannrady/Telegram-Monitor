import { useGetDashboardStats, useGetMessageCounts, useGetActivity, useGetChats, useGetBotUpdates } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as ActivityIcon, MessageSquare, Users, MessageCircle, Clock } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: messageCounts, isLoading: countsLoading } = useGetMessageCounts({ days: 7 });
  const { data: activityList, isLoading: activityLoading } = useGetActivity({ limit: 10 });
  const { data: chatList, isLoading: chatsLoading } = useGetChats();

  const statCards = [
    {
      title: "Total",
      value: stats?.totalMessages || 0,
      icon: MessageSquare,
      description: "Messages",
    },
    {
      title: "Today",
      value: stats?.todayMessages || 0,
      icon: ActivityIcon,
      description: "Messages",
    },
    {
      title: "Chats",
      value: stats?.totalChats || 0,
      icon: MessageCircle,
      description: "Active",
    },
    {
      title: "Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Unique",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Bot activity overview</p>
      </div>

      {/* Stats Grid — 2-column on mobile */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase()}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                <div className="bg-primary/10 p-1 rounded-md">
                  <stat.icon className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {statsLoading ? "..." : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message Volume Chart */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold">Message Volume (7 days)</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <div className="h-[180px] w-full">
            {countsLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
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
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }}
                    labelFormatter={(val) => format(parseISO(val as string), 'MMM d, yyyy')}
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
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {activityLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : activityList?.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              activityList?.activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3" data-testid={`activity-item-${activity.id}`}>
                  <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full flex-shrink-0">
                    <Clock className="h-3 w-3 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.fromName && `${activity.fromName} · `}
                      {format(parseISO(activity.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Chats */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold">Active Chats</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {chatsLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : chatList?.chats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No chats found.</p>
            ) : (
              chatList?.chats.slice(0, 5).map((chat) => (
                <div
                  key={chat.chatId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                  data-testid={`chat-item-${chat.chatId}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title || chat.chatId}</p>
                    <p className="text-xs text-muted-foreground capitalize">{chat.type}</p>
                  </div>
                  <div className="ml-3 flex-shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">
                    <span className="text-xs font-medium text-primary">{chat.messageCount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
