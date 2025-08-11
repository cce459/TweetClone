import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'retweet' | 'follow' | 'mention';
  fromUserId: string;
  tweetId?: string;
  read: boolean;
  createdAt: string;
  fromUser: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  tweet?: {
    id: string;
    content: string;
  };
}

export default function Notifications() {
  const { setTheme, theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user/me"],
  });

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", currentUser?.id],
    enabled: !!currentUser,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/notifications/${currentUser?.id}/mark-all-read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return 'fas fa-heart text-twitter-red';
      case 'retweet': return 'fas fa-retweet text-green-500';
      case 'follow': return 'fas fa-user-plus text-twitter-blue';
      case 'mention': return 'fas fa-at text-twitter-blue';
      default: return 'fas fa-bell text-twitter-blue';
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return `liked your tweet: "${notification.tweet?.content?.substring(0, 50)}${notification.tweet?.content && notification.tweet.content.length > 50 ? '...' : ''}"`;
      case 'retweet':
        return `retweeted your tweet: "${notification.tweet?.content?.substring(0, 50)}${notification.tweet?.content && notification.tweet.content.length > 50 ? '...' : ''}"`;
      case 'follow':
        return 'started following you';
      case 'mention':
        return `mentioned you in a tweet: "${notification.tweet?.content?.substring(0, 50)}${notification.tweet?.content && notification.tweet.content.length > 50 ? '...' : ''}"`;
      default:
        return 'sent you a notification';
    }
  };

  return (
    <div className="min-h-screen bg-twitter-background dark:bg-black flex max-w-7xl mx-auto">
      <Sidebar onTweetClick={() => {}} />
      
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-twitter-extra-light-gray dark:border-gray-800 lg:hidden z-50">
        <div className="flex justify-around py-3">
          <Link href="/">
            <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
              <i className="fas fa-home text-xl"></i>
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
              <i className="fas fa-search text-xl"></i>
            </Button>
          </Link>
          <Link href="/notifications">
            <Button variant="ghost" className="p-2 text-twitter-blue">
              <i className="fas fa-bell text-xl"></i>
            </Button>
          </Link>
          <Link href="/messages">
            <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
              <i className="fas fa-envelope text-xl"></i>
            </Button>
          </Link>
        </div>
      </div>

      <main className="flex-1 lg:max-w-2xl border-r border-twitter-extra-light-gray dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md border-b border-twitter-extra-light-gray dark:border-gray-800 p-4 z-40">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-twitter-black dark:text-white">Notifications</h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-sm text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10 px-3 py-1 rounded-full"
              >
                Mark all read
              </Button>
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="p-2 text-twitter-dark-gray dark:text-gray-400"
              >
                <i className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}></i>
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-twitter-extra-light-gray dark:divide-gray-800">
          {isLoading ? (
            <div className="p-8 text-center">
              <i className="fas fa-spinner fa-spin text-twitter-blue text-2xl"></i>
              <p className="mt-2 text-twitter-dark-gray dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-twitter-extra-light-gray dark:hover:bg-gray-900 transition-colors ${
                  !notification.read ? 'bg-twitter-blue bg-opacity-5' : ''
                }`}
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <i className={`${getNotificationIcon(notification.type)} text-2xl`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={notification.fromUser.avatar} alt={notification.fromUser.name} />
                        <AvatarFallback>{notification.fromUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-twitter-black dark:text-white">
                        {notification.fromUser.name}
                      </span>
                      {notification.fromUser.verified && (
                        <i className="fas fa-check-circle text-twitter-blue text-sm"></i>
                      )}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-twitter-blue rounded-full"></div>
                      )}
                    </div>
                    <p className="text-twitter-dark-gray dark:text-gray-400 mb-1">
                      {getNotificationText(notification)}
                    </p>
                    <p className="text-sm text-twitter-dark-gray dark:text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <i className="fas fa-bell text-twitter-dark-gray dark:text-gray-400 text-4xl mb-4"></i>
              <h2 className="text-xl font-bold text-twitter-black dark:text-white mb-2">
                No notifications yet
              </h2>
              <p className="text-twitter-dark-gray dark:text-gray-400">
                When someone likes, retweets, or follows you, you'll see it here.
              </p>
            </div>
          )}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}