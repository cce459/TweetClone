import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { TweetCard } from "@/components/tweet-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { TweetWithAuthor } from "@shared/schema";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const { setTheme, theme } = useTheme();

  const { data: searchResults, isLoading } = useQuery<TweetWithAuthor[]>({
    queryKey: ["/api/search/tweets", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const { data: trendingTopics } = useQuery<Array<{ id: string; topic: string; category: string; tweetCount: number }>>({
    queryKey: ["/api/trending"],
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
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
            <Button variant="ghost" className="p-2 text-twitter-blue">
              <i className="fas fa-search text-xl"></i>
            </Button>
          </Link>
          <Link href="/notifications">
            <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
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
            <h1 className="text-xl font-bold text-twitter-black dark:text-white">Explore</h1>
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="p-2 text-twitter-dark-gray dark:text-gray-400"
            >
              <i className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}></i>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-twitter-extra-light-gray dark:border-gray-800">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-twitter-dark-gray dark:text-gray-400"></i>
            <Input
              type="text"
              placeholder="Search Twitter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-twitter-extra-light-gray dark:bg-gray-800 border-none rounded-full h-12 text-twitter-black dark:text-white placeholder-twitter-dark-gray dark:placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-twitter-blue"
            />
          </div>
        </div>

        {/* Trending Topics */}
        {!searchQuery && (
          <div className="p-4">
            <h2 className="text-xl font-bold text-twitter-black dark:text-white mb-4">What's happening</h2>
            <div className="space-y-3">
              {trendingTopics?.map((topic, index) => (
                <div key={topic.hashtag} className="p-3 hover:bg-twitter-extra-light-gray dark:hover:bg-gray-900 rounded-lg cursor-pointer transition-colors">
                  <div className="text-sm text-twitter-dark-gray dark:text-gray-400">
                    Trending in Technology
                  </div>
                  <div className="font-bold text-twitter-black dark:text-white">
                    #{topic.hashtag}
                  </div>
                  <div className="text-sm text-twitter-dark-gray dark:text-gray-400">
                    {topic.count.toLocaleString()} Tweets
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="divide-y divide-twitter-extra-light-gray dark:divide-gray-800">
            {isLoading ? (
              <div className="p-8 text-center">
                <i className="fas fa-spinner fa-spin text-twitter-blue text-2xl"></i>
                <p className="mt-2 text-twitter-dark-gray dark:text-gray-400">Searching...</p>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-twitter-dark-gray dark:text-gray-400">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </main>

      <RightSidebar />
    </div>
  );
}