import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TweetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TweetModal({ open, onOpenChange }: TweetModalProps) {
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
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl mx-4 max-h-96">
        <DialogHeader className="flex items-center justify-between p-4 border-b border-twitter-extra-light-gray dark:border-gray-800">
          <DialogTitle className="sr-only">Compose Tweet</DialogTitle>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="text-twitter-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canTweet || createTweetMutation.isPending}
            className="bg-twitter-blue hover:bg-twitter-dark-blue text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
          >
            {createTweetMutation.isPending ? "Posting..." : "Tweet"}
          </Button>
        </DialogHeader>
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full resize-none border-none outline-none bg-transparent text-xl placeholder-twitter-dark-gray dark:placeholder-gray-400 text-twitter-black dark:text-white min-h-[150px] focus-visible:ring-0"
                maxLength={280}
                autoFocus
              />
              <div className="flex items-center justify-end mt-3">
                <span className={`text-sm mr-3 ${content.length > 260 ? 'text-twitter-red' : 'text-twitter-dark-gray dark:text-gray-400'}`}>
                  {280 - content.length}
                </span>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
