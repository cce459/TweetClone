import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { TweetComposer } from "@/components/tweet-composer";
import { TweetCard } from "@/components/tweet-card";
import { TweetModal } from "@/components/tweet-modal";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { TweetWithAuthor } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  const { data: tweets, isLoading } = useQuery<TweetWithAuthor[]>({
    queryKey: ["/api/tweets"],
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-twitter-background dark:bg-black flex max-w-7xl mx-auto">
        <Sidebar onTweetClick={() => setIsTweetModalOpen(true)} />
        <main className="flex-1 lg:max-w-2xl border-r border-twitter-extra-light-gray dark:border-gray-800">
          <div className="sticky top-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md border-b border-twitter-extra-light-gray dark:border-gray-800 p-4 z-40">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-twitter-black dark:text-white">Home</h1>
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="p-2 text-twitter-dark-gray dark:text-gray-400"
              >
                <i className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}></i>
              </Button>
            </div>
          </div>
          <div className="space-y-4 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-twitter-background dark:bg-black flex max-w-7xl mx-auto">
      <Sidebar onTweetClick={() => setIsTweetModalOpen(true)} />
      
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-twitter-extra-light-gray dark:border-gray-800 lg:hidden z-50">
        <div className="flex justify-around py-3">
          <Button variant="ghost" className="p-2 text-twitter-black dark:text-white">
            <i className="fas fa-home text-xl"></i>
          </Button>
          <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
            <i className="fas fa-search text-xl"></i>
          </Button>
          <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
            <i className="fas fa-bell text-xl"></i>
          </Button>
          <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
            <i className="fas fa-envelope text-xl"></i>
          </Button>
        </div>
      </div>

      <main className="flex-1 lg:max-w-2xl border-r border-twitter-extra-light-gray dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md border-b border-twitter-extra-light-gray dark:border-gray-800 p-4 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="lg:hidden p-2">
                <i className="fas fa-bars text-twitter-black dark:text-white"></i>
              </Button>
              <h1 className="text-xl font-bold text-twitter-black dark:text-white">Home</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="p-2 text-twitter-dark-gray dark:text-gray-400"
              >
                <i className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}></i>
              </Button>
              <Button
                onClick={() => setIsTweetModalOpen(true)}
                className="lg:hidden bg-twitter-blue text-white p-2 rounded-full"
              >
                <i className="fas fa-plus"></i>
              </Button>
            </div>
          </div>
        </div>

        <TweetComposer />

        {/* Tweet Feed */}
        <div className="divide-y divide-twitter-extra-light-gray dark:divide-gray-800">
          {tweets?.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      </main>

      <RightSidebar />

      <TweetModal 
        open={isTweetModalOpen} 
        onOpenChange={setIsTweetModalOpen} 
      />
    </div>
  );
}
