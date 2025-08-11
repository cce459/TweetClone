import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SuggestedUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
  verified: boolean;
  bio?: string;
}

export function RightSidebar() {
  const { data: currentUser } = useQuery({
    queryKey: ["/api/user/me"],
  });

  const { data: suggestedUsers } = useQuery<SuggestedUser[]>({
    queryKey: ["/api/users", currentUser?.id, "suggested"],
    enabled: !!currentUser,
  });

  const { data: trendingTopics } = useQuery<Array<{ hashtag: string; count: number }>>({
    queryKey: ["/api/trending"],
  });

  return (
    <aside className="hidden xl:block w-80 p-4 space-y-4">
      {/* Trending */}
      <div className="bg-twitter-extra-light-gray dark:bg-gray-900 rounded-2xl p-4">
        <h2 className="text-xl font-bold text-twitter-black dark:text-white mb-4">What's happening</h2>
        <div className="space-y-3">
          {trendingTopics?.slice(0, 5).map((topic, index) => (
            <div key={topic.hashtag} className="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-lg cursor-pointer transition-colors">
              <div className="text-sm text-twitter-dark-gray dark:text-gray-400">
                Trending in Technology
              </div>
              <div className="font-bold text-twitter-black dark:text-white">
                #{topic.hashtag}
              </div>
              <div className="text-sm text-twitter-dark-gray dark:text-gray-400">
                {(topic.count || 0).toLocaleString()} Tweets
              </div>
            </div>
          ))}
          <Button variant="ghost" className="text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10 p-3 rounded-full w-full text-left justify-start">
            Show more
          </Button>
        </div>
      </div>

      {/* Who to follow */}
      <div className="bg-twitter-extra-light-gray dark:bg-gray-900 rounded-2xl p-4">
        <h2 className="text-xl font-bold text-twitter-black dark:text-white mb-4">Who to follow</h2>
        <div className="space-y-3">
          {suggestedUsers?.slice(0, 3).map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-twitter-black dark:text-white truncate">
                      {user.name}
                    </h3>
                    {user.verified && (
                      <i className="fas fa-check-circle text-twitter-blue text-sm"></i>
                    )}
                  </div>
                  <p className="text-twitter-dark-gray dark:text-gray-400 text-sm truncate">
                    @{user.username}
                  </p>
                </div>
              </div>
              <Button className="bg-twitter-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold py-1 px-4 rounded-full">
                Follow
              </Button>
            </div>
          ))}
          <Button variant="ghost" className="text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10 p-3 rounded-full w-full text-left justify-start">
            Show more
          </Button>
        </div>
      </div>
    </aside>
  );
}