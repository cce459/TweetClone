import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TweetWithAuthor } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TweetCardProps {
  tweet: TweetWithAuthor;
}

export function TweetCard({ tweet }: TweetCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(tweet.likes || 0);
  const [retweetCount, setRetweetCount] = useState(tweet.retweets || 0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user/me"],
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/tweets/${tweet.id}/like`, {
        userId: currentUser?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      queryClient.invalidateQueries({ queryKey: ["/api/tweets"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    likeMutation.mutate();
  };

  const retweetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/tweets/${tweet.id}/retweet`, {
        userId: currentUser?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsRetweeted(data.retweeted);
      setRetweetCount(prev => data.retweeted ? prev + 1 : prev - 1);
      queryClient.invalidateQueries({ queryKey: ["/api/tweets"] });
      toast({
        title: data.retweeted ? "Retweeted" : "Retweet undone",
        description: data.retweeted ? "Tweet retweeted to your followers" : "Retweet removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to retweet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/tweets/${tweet.id}/bookmark`, {
        userId: currentUser?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsBookmarked(data.bookmarked);
      toast({
        title: data.bookmarked ? "Bookmarked" : "Bookmark removed",
        description: data.bookmarked ? "Tweet saved to bookmarks" : "Tweet removed from bookmarks",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to bookmark. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Feature coming soon",
      description: "Reply functionality is being developed.",
    });
  };

  const handleRetweet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    retweetMutation.mutate();
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    bookmarkMutation.mutate();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/tweet/${tweet.id}`);
    toast({
      title: "Link copied",
      description: "Tweet link copied to clipboard.",
    });
  };

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const tweetDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - tweetDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - tweetDate.getTime()) / (1000 * 60));
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  return (
    <article className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
      <div className="flex space-x-3">
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={tweet.author.avatar} alt={tweet.author.name} />
          <AvatarFallback>{tweet.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 flex-wrap">
            <h3 className="font-bold text-twitter-black dark:text-white">{tweet.author.name}</h3>
            {tweet.author.verified && (
              <i className="fas fa-check-circle text-twitter-blue text-sm"></i>
            )}
            <span className="text-twitter-dark-gray dark:text-gray-400">@{tweet.author.username}</span>
            <span className="text-twitter-dark-gray dark:text-gray-400">·</span>
            <span className="text-twitter-dark-gray dark:text-gray-400">{formatTime(tweet.createdAt!)}</span>
          </div>
          <p className="text-twitter-black dark:text-white mt-1 break-words">
            {tweet.content}
          </p>
          {tweet.images && tweet.images.length > 0 && (
            <img
              src={tweet.images[0]}
              alt="Tweet attachment"
              className="mt-3 rounded-2xl max-w-full h-auto border border-twitter-extra-light-gray dark:border-gray-700"
            />
          )}
          
          <div className="flex items-center justify-between mt-3 max-w-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReply}
              className="flex items-center space-x-2 text-twitter-dark-gray dark:text-gray-400 hover:text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10 p-2 rounded-full transition-colors"
            >
              <i className="fas fa-comment"></i>
              <span className="text-sm">{tweet.replies}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetweet}
              disabled={retweetMutation.isPending}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-full transition-colors",
                isRetweeted
                  ? "text-green-500 hover:bg-green-500 hover:bg-opacity-10"
                  : "text-twitter-dark-gray dark:text-gray-400 hover:text-green-500 hover:bg-green-500 hover:bg-opacity-10"
              )}
            >
              <i className={`fas fa-retweet ${retweetMutation.isPending ? 'animate-pulse' : ''}`}></i>
              <span className="text-sm">{retweetCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-full transition-colors",
                isLiked
                  ? "text-twitter-red hover:bg-twitter-red hover:bg-opacity-10"
                  : "text-twitter-dark-gray dark:text-gray-400 hover:text-twitter-red hover:bg-twitter-red hover:bg-opacity-10"
              )}
            >
              <i className={`fas fa-heart ${likeMutation.isPending ? 'animate-pulse' : ''}`}></i>
              <span className="text-sm">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
              className={cn(
                "p-2 rounded-full transition-colors",
                isBookmarked
                  ? "text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10"
                  : "text-twitter-dark-gray dark:text-gray-400 hover:text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10"
              )}
            >
              <i className={`${isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'} ${bookmarkMutation.isPending ? 'animate-pulse' : ''}`}></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-twitter-dark-gray dark:text-gray-400 hover:text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10 p-2 rounded-full transition-colors"
            >
              <i className="fas fa-share"></i>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
