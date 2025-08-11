import { type User, type Tweet, type Like, type Follow, type InsertUser, type InsertTweet, type InsertLike, type InsertFollow, type TweetWithAuthor } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  // Tweets
  getTweets(): Promise<TweetWithAuthor[]>;
  getTweet(id: string): Promise<TweetWithAuthor | undefined>;
  createTweet(tweet: InsertTweet): Promise<Tweet>;
  getUserTweets(userId: string): Promise<TweetWithAuthor[]>;

  // Likes
  likeTweet(like: InsertLike): Promise<Like>;
  unlikeTweet(userId: string, tweetId: string): Promise<boolean>;
  isLiked(userId: string, tweetId: string): Promise<boolean>;

  // Follows
  followUser(follow: InsertFollow): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<boolean>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tweets: Map<string, Tweet>;
  private likes: Map<string, Like>;
  private follows: Map<string, Follow>;

  constructor() {
    this.users = new Map();
    this.tweets = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.seedData();
  }

  private seedData() {
    // Create some initial users
    const users = [
      {
        id: "user1",
        username: "sarahjohnson",
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c3c918?w=100&h=100&fit=crop&crop=face",
        verified: false,
        bio: "Software developer passionate about TypeScript and React",
        following: 245,
        followers: 1200,
        createdAt: new Date(),
      },
      {
        id: "user2",
        username: "alexchen",
        name: "Alex Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        verified: false,
        bio: "Full-stack engineer building the future",
        following: 180,
        followers: 850,
        createdAt: new Date(),
      },
      {
        id: "user3",
        username: "emmarodriguez",
        name: "Emma Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        verified: true,
        bio: "UX Designer | Tech enthusiast | Coffee lover",
        following: 320,
        followers: 2100,
        createdAt: new Date(),
      },
      {
        id: "user4",
        username: "davidkim",
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        verified: false,
        bio: "JavaScript developer and open source contributor",
        following: 150,
        followers: 680,
        createdAt: new Date(),
      },
      {
        id: "user5",
        username: "lisawang",
        name: "Lisa Wang",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
        verified: true,
        bio: "Startup founder | Building the next big thing",
        following: 500,
        followers: 5200,
        createdAt: new Date(),
      },
    ];

    users.forEach(user => this.users.set(user.id, user));

    // Create some initial tweets
    const tweets = [
      {
        id: "tweet1",
        content: "Just finished implementing a new authentication system using TypeScript and modern web APIs. The type safety really makes a difference in catching errors early! 🚀 #WebDev #TypeScript",
        authorId: "user2",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
        likes: 45,
        retweets: 8,
        replies: 12,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "tweet2",
        content: "The new dark mode implementation is looking amazing! 🌙 The contrast ratios are perfect and it's so much easier on the eyes. Props to the design team for nailing the accessibility standards.",
        authorId: "user3",
        likes: 89,
        retweets: 15,
        replies: 23,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: "tweet3",
        content: "Hot take: TypeScript's strict mode should be enabled by default in all new projects. The initial learning curve is worth the long-term benefits in maintainability and bug prevention. 🔥",
        authorId: "user4",
        likes: 234,
        retweets: 67,
        replies: 156,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: "tweet4",
        content: "Just launched our new social platform built entirely with modern web technologies! The responsive design works seamlessly across all devices. Proud of what our small team accomplished 💪",
        authorId: "user5",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
        likes: 412,
        retweets: 156,
        replies: 89,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
    ];

    tweets.forEach(tweet => this.tweets.set(tweet.id, tweet));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      following: 0,
      followers: 0,
      verified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTweets(): Promise<TweetWithAuthor[]> {
    const tweets = Array.from(this.tweets.values());
    const tweetsWithAuthors = await Promise.all(
      tweets.map(async (tweet) => {
        const author = await this.getUser(tweet.authorId);
        return {
          ...tweet,
          author: author!,
        };
      })
    );
    
    return tweetsWithAuthors.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTweet(id: string): Promise<TweetWithAuthor | undefined> {
    const tweet = this.tweets.get(id);
    if (!tweet) return undefined;
    
    const author = await this.getUser(tweet.authorId);
    if (!author) return undefined;
    
    return {
      ...tweet,
      author,
    };
  }

  async createTweet(insertTweet: InsertTweet): Promise<Tweet> {
    const id = randomUUID();
    const tweet: Tweet = {
      ...insertTweet,
      id,
      likes: 0,
      retweets: 0,
      replies: 0,
      createdAt: new Date(),
    };
    this.tweets.set(id, tweet);
    return tweet;
  }

  async getUserTweets(userId: string): Promise<TweetWithAuthor[]> {
    const tweets = Array.from(this.tweets.values()).filter(tweet => tweet.authorId === userId);
    const tweetsWithAuthors = await Promise.all(
      tweets.map(async (tweet) => {
        const author = await this.getUser(tweet.authorId);
        return {
          ...tweet,
          author: author!,
        };
      })
    );
    
    return tweetsWithAuthors.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async likeTweet(insertLike: InsertLike): Promise<Like> {
    const id = randomUUID();
    const like: Like = {
      ...insertLike,
      id,
      createdAt: new Date(),
    };
    this.likes.set(id, like);
    
    // Update tweet like count
    const tweet = this.tweets.get(insertLike.tweetId);
    if (tweet) {
      tweet.likes = (tweet.likes || 0) + 1;
      this.tweets.set(tweet.id, tweet);
    }
    
    return like;
  }

  async unlikeTweet(userId: string, tweetId: string): Promise<boolean> {
    const like = Array.from(this.likes.values()).find(
      l => l.userId === userId && l.tweetId === tweetId
    );
    
    if (!like) return false;
    
    this.likes.delete(like.id);
    
    // Update tweet like count
    const tweet = this.tweets.get(tweetId);
    if (tweet) {
      tweet.likes = Math.max(0, (tweet.likes || 0) - 1);
      this.tweets.set(tweet.id, tweet);
    }
    
    return true;
  }

  async isLiked(userId: string, tweetId: string): Promise<boolean> {
    return Array.from(this.likes.values()).some(
      like => like.userId === userId && like.tweetId === tweetId
    );
  }

  async followUser(insertFollow: InsertFollow): Promise<Follow> {
    const id = randomUUID();
    const follow: Follow = {
      ...insertFollow,
      id,
      createdAt: new Date(),
    };
    this.follows.set(id, follow);
    
    // Update follower/following counts
    const follower = this.users.get(insertFollow.followerId);
    const following = this.users.get(insertFollow.followingId);
    
    if (follower) {
      follower.following = (follower.following || 0) + 1;
      this.users.set(follower.id, follower);
    }
    
    if (following) {
      following.followers = (following.followers || 0) + 1;
      this.users.set(following.id, following);
    }
    
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const follow = Array.from(this.follows.values()).find(
      f => f.followerId === followerId && f.followingId === followingId
    );
    
    if (!follow) return false;
    
    this.follows.delete(follow.id);
    
    // Update follower/following counts
    const follower = this.users.get(followerId);
    const following = this.users.get(followingId);
    
    if (follower) {
      follower.following = Math.max(0, (follower.following || 0) - 1);
      this.users.set(follower.id, follower);
    }
    
    if (following) {
      following.followers = Math.max(0, (following.followers || 0) - 1);
      this.users.set(following.id, following);
    }
    
    return true;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      follow => follow.followerId === followerId && follow.followingId === followingId
    );
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(follow => follow.followingId === userId)
      .map(follow => follow.followerId);
    
    return followerIds.map(id => this.users.get(id)).filter(Boolean) as User[];
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId)
      .map(follow => follow.followingId);
    
    return followingIds.map(id => this.users.get(id)).filter(Boolean) as User[];
  }
}

export const storage = new MemStorage();
