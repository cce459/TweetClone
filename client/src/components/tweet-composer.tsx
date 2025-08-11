import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface TweetComposerProps {
  className?: string;
}

export function TweetComposer({ className }: TweetComposerProps) {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user/me"],
  });

  const createTweetMutation = useMutation({
    mutationFn: async (tweetData: { content: string; authorId: string }) => {
      const response = await apiRequest("POST", "/api/tweets", tweetData);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/tweets"] });
      toast({
        title: "Tweet posted!",
        description: "Your tweet has been successfully posted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post tweet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUser) return;

    createTweetMutation.mutate({
      content: content.trim(),
      authorId: currentUser.id,
    });
  };

  const canTweet = content.trim().length > 0 && content.length <= 280;

  return (
    <div className={`border-b border-twitter-extra-light-gray dark:border-gray-800 p-4 ${className}`}>
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
          <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full resize-none border-none outline-none bg-transparent text-xl placeholder-twitter-dark-gray dark:placeholder-gray-400 text-twitter-black dark:text-white min-h-[100px] focus-visible:ring-0"
            maxLength={280}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10 p-2 rounded-full transition-colors"
              >
                <i className="fas fa-image"></i>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10 p-2 rounded-full transition-colors"
              >
                <i className="fas fa-film"></i>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10 p-2 rounded-full transition-colors"
              >
                <i className="fas fa-poll"></i>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-twitter-blue hover:bg-twitter-blue hover:bg-opacity-10 p-2 rounded-full transition-colors"
              >
                <i className="fas fa-smile"></i>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${content.length > 260 ? 'text-twitter-red' : 'text-twitter-dark-gray dark:text-gray-400'}`}>
                {280 - content.length}
              </span>
              <Button
                type="submit"
                disabled={!canTweet || createTweetMutation.isPending}
                className="bg-twitter-blue hover:bg-twitter-dark-blue text-white font-bold py-2 px-6 rounded-full disabled:opacity-50 transition-colors duration-200"
              >
                {createTweetMutation.isPending ? "Posting..." : "Tweet"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
