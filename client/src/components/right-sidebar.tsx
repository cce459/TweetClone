import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export function RightSidebar() {
  const { toast } = useToast();

  const trendingTopics = [
    { category: "Trending in Technology", topic: "#TypeScript", tweets: "42.1K" },
    { category: "Trending in Web Development", topic: "#ResponsiveDesign", tweets: "28.5K" },
    { category: "Technology · Trending", topic: "JavaScript Frameworks", tweets: "18.3K" },
    { category: "Trending", topic: "#DarkMode", tweets: "15.7K" },
  ];

  const suggestedUsers = [
    {
      id: "user6",
      name: "Mike Johnson",
      username: "mikejohnson",
      avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: "user7",
      name: "Anna Thompson",
      username: "annathompson",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: "user8",
      name: "Ryan Foster",
      username: "ryanfoster",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
  ];

  const handleFollow = (username: string) => {
    toast({
      title: "Feature coming soon",
      description: `Follow functionality for @${username} is being developed.`,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feature coming soon",
      description: "Search functionality is being developed.",
    });
  };

  return (
    <aside className="w-80 p-4 space-y-4 hidden lg:block">
      {/* Search Bar */}
      <div className="sticky top-4">
        <form onSubmit={handleSearch} className="relative">
          <i className="fas fa-search absolute left-4 top-3.5 text-twitter-dark-gray dark:text-gray-400"></i>
          <Input
            type="text"
            placeholder="Search Twitter"
            className="w-full bg-twitter-extra-light-gray dark:bg-gray-900 border border-transparent focus:border-twitter-blue focus:bg-white dark:focus:bg-gray-800 rounded-full py-3 pl-12 pr-4 text-twitter-black dark:text-white placeholder-twitter-dark-gray dark:placeholder-gray-400 outline-none transition-colors"
          />
        </form>
      </div>

      {/* Trending */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        <h2 className="text-xl font-bold text-twitter-black dark:text-white p-4 border-b border-twitter-extra-light-gray dark:border-gray-800">
          What's happening
        </h2>
        <div className="divide-y divide-twitter-extra-light-gray dark:divide-gray-800">
          {trendingTopics.map((topic, index) => (
            <div
              key={index}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <p className="text-sm text-twitter-dark-gray dark:text-gray-400">{topic.category}</p>
              <p className="font-bold text-twitter-black dark:text-white">{topic.topic}</p>
              <p className="text-sm text-twitter-dark-gray dark:text-gray-400">{topic.tweets} Tweets</p>
            </div>
          ))}
        </div>
      </div>

      {/* Who to Follow */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        <h2 className="text-xl font-bold text-twitter-black dark:text-white p-4 border-b border-twitter-extra-light-gray dark:border-gray-800">
          Who to follow
        </h2>
        <div className="divide-y divide-twitter-extra-light-gray dark:divide-gray-800">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-twitter-black dark:text-white">{user.name}</p>
                  <p className="text-sm text-twitter-dark-gray dark:text-gray-400">@{user.username}</p>
                </div>
              </div>
              <Button
                onClick={() => handleFollow(user.username)}
                className="bg-twitter-black dark:bg-white text-white dark:text-black font-bold py-2 px-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
