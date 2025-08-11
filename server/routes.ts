import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTweetSchema, insertLikeSchema, insertFollowSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
