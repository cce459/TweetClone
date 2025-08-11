import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTweetSchema, 
  insertLikeSchema, 
  insertFollowSchema,
  insertBookmarkSchema,
  insertRetweetSchema,
  insertNotificationSchema,
  insertDirectMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tweets
  app.get("/api/tweets", async (req, res) => {
    try {
      const tweets = await storage.getTweets();
      res.json(tweets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tweets" });
    }
  });

  // Get single tweet
  app.get("/api/tweets/:id", async (req, res) => {
    try {
      const tweet = await storage.getTweet(req.params.id);
      if (!tweet) {
        return res.status(404).json({ message: "Tweet not found" });
      }
      res.json(tweet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tweet" });
    }
  });

  // Create tweet
  app.post("/api/tweets", async (req, res) => {
    try {
      const tweetData = insertTweetSchema.parse(req.body);
      const tweet = await storage.createTweet(tweetData);
      res.status(201).json(tweet);
    } catch (error) {
      res.status(400).json({ message: "Invalid tweet data" });
    }
  });

  // Get user tweets
  app.get("/api/users/:userId/tweets", async (req, res) => {
    try {
      const tweets = await storage.getUserTweets(req.params.userId);
      res.json(tweets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user tweets" });
    }
  });

  // Like tweet
  app.post("/api/tweets/:tweetId/like", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const isAlreadyLiked = await storage.isLiked(userId, req.params.tweetId);
      if (isAlreadyLiked) {
        await storage.unlikeTweet(userId, req.params.tweetId);
        res.json({ liked: false });
      } else {
        await storage.likeTweet({ userId, tweetId: req.params.tweetId });
        res.json({ liked: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Follow user
  app.post("/api/users/:userId/follow", async (req, res) => {
    try {
      const { followerId } = req.body;
      if (!followerId) {
        return res.status(400).json({ message: "Follower ID required" });
      }

      const isAlreadyFollowing = await storage.isFollowing(followerId, req.params.userId);
      if (isAlreadyFollowing) {
        await storage.unfollowUser(followerId, req.params.userId);
        res.json({ following: false });
      } else {
        await storage.followUser({ followerId, followingId: req.params.userId });
        res.json({ following: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle follow" });
    }
  });

  // Get user profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current user (mock for now)
  app.get("/api/user/me", async (req, res) => {
    try {
      // For demo purposes, return the first user as current user
      const user = await storage.getUser("user1");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current user" });
    }
  });

  // Search users
  app.get("/api/users/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query required" });
      }
      const users = await storage.searchUsers(q);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Get user followers
  app.get("/api/users/:userId/followers", async (req, res) => {
    try {
      const followers = await storage.getFollowers(req.params.userId);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  // Get user following
  app.get("/api/users/:userId/following", async (req, res) => {
    try {
      const following = await storage.getFollowing(req.params.userId);
      res.json(following);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  // Get suggested users
  app.get("/api/users/:userId/suggested", async (req, res) => {
    try {
      const suggested = await storage.getSuggestedUsers(req.params.userId);
      res.json(suggested);
    } catch (error) {
      console.error("Error fetching suggested users:", error);
      res.status(500).json({ message: "Failed to fetch suggested users" });
    }
  });

  // Search tweets
  app.get("/api/tweets/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query required" });
      }
      const tweets = await storage.searchTweets(q);
      res.json(tweets);
    } catch (error) {
      res.status(500).json({ message: "Failed to search tweets" });
    }
  });

  // Get trending tweets
  app.get("/api/tweets/trending", async (req, res) => {
    try {
      const tweets = await storage.getTrendingTweets();
      res.json(tweets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending tweets" });
    }
  });

  // Get tweet replies
  app.get("/api/tweets/:tweetId/replies", async (req, res) => {
    try {
      const replies = await storage.getTweetReplies(req.params.tweetId);
      res.json(replies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  // Bookmark tweet
  app.post("/api/tweets/:tweetId/bookmark", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const isBookmarked = await storage.isBookmarked(userId, req.params.tweetId);
      if (isBookmarked) {
        await storage.unbookmarkTweet(userId, req.params.tweetId);
        res.json({ bookmarked: false });
      } else {
        await storage.bookmarkTweet({ userId, tweetId: req.params.tweetId });
        res.json({ bookmarked: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  // Retweet tweet
  app.post("/api/tweets/:tweetId/retweet", async (req, res) => {
    try {
      const { userId, comment } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const isRetweeted = await storage.isRetweeted(userId, req.params.tweetId);
      if (isRetweeted) {
        await storage.unretweetTweet(userId, req.params.tweetId);
        res.json({ retweeted: false });
      } else {
        await storage.retweetTweet({ userId, tweetId: req.params.tweetId, comment });
        res.json({ retweeted: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle retweet" });
    }
  });

  // Get user bookmarks
  app.get("/api/users/:userId/bookmarks", async (req, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks(req.params.userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  // Get user likes
  app.get("/api/users/:userId/likes", async (req, res) => {
    try {
      const likes = await storage.getUserLikes(req.params.userId);
      res.json(likes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  // Get user retweets
  app.get("/api/users/:userId/retweets", async (req, res) => {
    try {
      const retweets = await storage.getUserRetweets(req.params.userId);
      res.json(retweets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch retweets" });
    }
  });

  // Get user notifications
  app.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.patch("/api/users/:userId/notifications/read", async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.params.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Get unread notification count
  app.get("/api/users/:userId/notifications/unread-count", async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.params.userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Get user conversations
  app.get("/api/users/:userId/conversations", async (req, res) => {
    try {
      const conversations = await storage.getUserConversations(req.params.userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Send direct message
  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const messageData = insertDirectMessageSchema.parse({
        ...req.body,
        conversationId: req.params.conversationId
      });
      const message = await storage.sendDirectMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Get conversation messages
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Create or get conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const { participantIds } = req.body;
      if (!participantIds || !Array.isArray(participantIds)) {
        return res.status(400).json({ message: "Participant IDs required" });
      }
      const conversation = await storage.getOrCreateConversation(participantIds);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Mark messages as read
  app.patch("/api/conversations/:conversationId/read", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      await storage.markMessagesAsRead(req.params.conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Get trending topics
  app.get("/api/trending", async (req, res) => {
    try {
      const { region } = req.query;
      const trending = await storage.getTrendingTopics(region as string);
      res.json(trending);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
