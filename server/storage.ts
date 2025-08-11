import { 
  type User, 
  type Tweet, 
  type Like, 
  type Follow, 
  type Bookmark,
  type Retweet,
  type Notification,
  type DirectMessage,
  type Conversation,
  type ConversationParticipant,
  type TrendingTopic,
  type Hashtag,
  type InsertUser, 
  type InsertTweet, 
  type InsertLike, 
  type InsertFollow,
  type InsertBookmark,
  type InsertRetweet,
  type InsertNotification,
  type InsertDirectMessage,
  type TweetWithAuthor,
  type NotificationWithUser,
  type ConversationWithParticipants,
  type DirectMessageWithSender
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;

  // Tweets
  getTweets(limit?: number, offset?: number): Promise<TweetWithAuthor[]>;
  getTweet(id: string): Promise<TweetWithAuthor | undefined>;
  createTweet(tweet: InsertTweet): Promise<Tweet>;
  getUserTweets(userId: string, limit?: number): Promise<TweetWithAuthor[]>;
  getTweetReplies(tweetId: string): Promise<TweetWithAuthor[]>;
  searchTweets(query: string): Promise<TweetWithAuthor[]>;
  getTrendingTweets(): Promise<TweetWithAuthor[]>;

  // Likes
  likeTweet(like: InsertLike): Promise<Like>;
  unlikeTweet(userId: string, tweetId: string): Promise<boolean>;
  isLiked(userId: string, tweetId: string): Promise<boolean>;
  getUserLikes(userId: string): Promise<TweetWithAuthor[]>;

  // Follows
  followUser(follow: InsertFollow): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<boolean>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  getSuggestedUsers(userId: string, limit?: number): Promise<User[]>;

  // Bookmarks
  bookmarkTweet(bookmark: InsertBookmark): Promise<Bookmark>;
  unbookmarkTweet(userId: string, tweetId: string): Promise<boolean>;
  isBookmarked(userId: string, tweetId: string): Promise<boolean>;
  getUserBookmarks(userId: string): Promise<TweetWithAuthor[]>;

  // Retweets
  retweetTweet(retweet: InsertRetweet): Promise<Retweet>;
  unretweetTweet(userId: string, tweetId: string): Promise<boolean>;
  isRetweeted(userId: string, tweetId: string): Promise<boolean>;
  getUserRetweets(userId: string): Promise<TweetWithAuthor[]>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<NotificationWithUser[]>;
  markNotificationAsRead(notificationId: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Direct Messages
  createConversation(participantIds: string[]): Promise<Conversation>;
  getOrCreateConversation(participantIds: string[]): Promise<Conversation>;
  getUserConversations(userId: string): Promise<ConversationWithParticipants[]>;
  sendDirectMessage(message: InsertDirectMessage): Promise<DirectMessage>;
  getConversationMessages(conversationId: string, limit?: number): Promise<DirectMessageWithSender[]>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<boolean>;

  // Trending & Hashtags
  getTrendingTopics(region?: string, limit?: number): Promise<TrendingTopic[]>;
  updateTrendingTopics(): Promise<void>;
  extractAndSaveHashtags(tweetId: string, content: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private tweets: Map<string, Tweet> = new Map();
  private likes: Map<string, Like> = new Map();
  private follows: Map<string, Follow> = new Map();
  private bookmarks: Map<string, Bookmark> = new Map();
  private retweets: Map<string, Retweet> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private conversationParticipants: Map<string, ConversationParticipant> = new Map();
  private directMessages: Map<string, DirectMessage> = new Map();
  private trendingTopics: Map<string, TrendingTopic> = new Map();
  private hashtags: Map<string, Hashtag> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create initial users
    const seedUsers = [
      {
        id: "user1",
        username: "sarahjohnson",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c3c918?w=100&h=100&fit=crop&crop=face",
        headerImage: null,
        verified: false,
        bio: "Software developer passionate about TypeScript and React",
        location: "San Francisco, CA",
        website: "https://sarahjohnson.dev",
        birthDate: null,
        following: 245,
        followers: 1200,
        tweetsCount: 89,
        joinedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "user2", 
        username: "alexchen",
        name: "Alex Chen",
        email: "alex@example.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        headerImage: null,
        verified: false,
        bio: "Full-stack engineer building the future",
        location: "New York, NY",
        website: null,
        birthDate: null,
        following: 180,
        followers: 850,
        tweetsCount: 156,
        joinedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "user3",
        username: "emmarodriguez", 
        name: "Emma Rodriguez",
        email: "emma@example.com",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        headerImage: null,
        verified: true,
        bio: "UX Designer | Tech enthusiast | Coffee lover",
        location: "Austin, TX",
        website: "https://emmarodriguez.design",
        birthDate: null,
        following: 320,
        followers: 2100,
        tweetsCount: 234,
        joinedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "user4",
        username: "davidkim",
        name: "David Kim",
        email: "david@example.com",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        headerImage: null,
        verified: false,
        bio: "JavaScript developer and open source contributor",
        location: "Seattle, WA",
        website: "https://github.com/davidkim",
        birthDate: null,
        following: 150,
        followers: 680,
        tweetsCount: 78,
        joinedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "user5",
        username: "lisawang",
        name: "Lisa Wang",
        email: "lisa@example.com",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
        headerImage: null,
        verified: true,
        bio: "Startup founder | Building the next big thing",
        location: "Los Angeles, CA",
        website: "https://lisawang.co",
        birthDate: null,
        following: 500,
        followers: 5200,
        tweetsCount: 445,
        joinedAt: new Date(),
        createdAt: new Date(),
      },
    ];

    seedUsers.forEach(user => this.users.set(user.id, user));

    // Create initial tweets
    const seedTweets = [
      {
        id: "tweet1",
        content: "Just finished implementing a new authentication system using TypeScript and modern web APIs. The type safety really makes a difference in catching errors early! 🚀 #WebDev #TypeScript",
        authorId: "user2",
        parentTweetId: null,
        images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop"],
        video: null,
        gif: null,
        poll: null,
        likes: 45,
        retweets: 8,
        replies: 12,
        views: 1240,
        isRetweet: false,
        retweetOfId: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "tweet2",
        content: "The new dark mode implementation is looking amazing! 🌙 The contrast ratios are perfect and it's so much easier on the eyes. Props to the design team for nailing the accessibility standards.",
        authorId: "user3",
        parentTweetId: null,
        images: null,
        video: null,
        gif: null,
        poll: null,
        likes: 89,
        retweets: 15,
        replies: 23,
        views: 2340,
        isRetweet: false,
        retweetOfId: null,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        id: "tweet3",
        content: "Hot take: TypeScript's strict mode should be enabled by default in all new projects. The initial learning curve is worth the long-term benefits in maintainability and bug prevention. 🔥",
        authorId: "user4",
        parentTweetId: null,
        images: null,
        video: null,
        gif: null,
        poll: null,
        likes: 234,
        retweets: 67,
        replies: 156,
        views: 5670,
        isRetweet: false,
        retweetOfId: null,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: "tweet4",
        content: "Just launched our new social platform built entirely with modern web technologies! The responsive design works seamlessly across all devices. Proud of what our small team accomplished 💪",
        authorId: "user5",
        parentTweetId: null,
        images: ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"],
        video: null,
        gif: null,
        poll: null,
        likes: 412,
        retweets: 156,
        replies: 89,
        views: 8900,
        isRetweet: false,
        retweetOfId: null,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    ];

    seedTweets.forEach(tweet => this.tweets.set(tweet.id, tweet));

    // Create some trending topics
    const seedTrending = [
      {
        id: "trend1",
        topic: "#TypeScript",
        category: "Technology",
        tweetCount: 42100,
        region: "global",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "trend2", 
        topic: "#ResponsiveDesign",
        category: "Web Development",
        tweetCount: 28500,
        region: "global",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "trend3",
        topic: "JavaScript Frameworks",
        category: "Technology",
        tweetCount: 18300,
        region: "global",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "trend4",
        topic: "#DarkMode",
        category: "Design",
        tweetCount: 15700,
        region: "global",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    seedTrending.forEach(trend => this.trendingTopics.set(trend.id, trend));

    console.log("In-memory storage seeded successfully");
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: randomUUID(),
      email: null,
      avatar: null,
      headerImage: null,
      verified: null,
      bio: null,
      location: null,
      website: null,
      birthDate: null,
      following: null,
      followers: null,
      tweetsCount: null,
      joinedAt: null,
      createdAt: null,
      ...insertUser,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async searchUsers(query: string): Promise<User[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.users.values())
      .filter(user => 
        user.name.toLowerCase().includes(lowerQuery) ||
        user.username.toLowerCase().includes(lowerQuery) ||
        (user.bio && user.bio.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 20);
  }

  // Tweets
  async getTweets(limit = 50, offset = 0): Promise<TweetWithAuthor[]> {
    const allTweets = Array.from(this.tweets.values())
      .sort((a, b) => (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime())
      .slice(offset, offset + limit);

    return allTweets.map(tweet => {
      const author = this.users.get(tweet.authorId);
      return {
        ...tweet,
        author: author!
      };
    });
  }

  async getTweet(id: string): Promise<TweetWithAuthor | undefined> {
    const tweet = this.tweets.get(id);
    if (!tweet) return undefined;
    
    const author = this.users.get(tweet.authorId);
    return {
      ...tweet,
      author: author!
    };
  }

  async createTweet(insertTweet: InsertTweet): Promise<Tweet> {
    const tweet: Tweet = {
      id: randomUUID(),
      parentTweetId: null,
      images: null,
      video: null,
      gif: null,
      poll: null,
      likes: null,
      retweets: null,
      replies: null,
      views: null,
      isRetweet: null,
      retweetOfId: null,
      createdAt: null,
      ...insertTweet,
    };

    this.tweets.set(tweet.id, tweet);

    // Update user's tweet count
    const user = this.users.get(insertTweet.authorId);
    if (user && user.tweetsCount !== null) {
      user.tweetsCount = (user.tweetsCount || 0) + 1;
      this.users.set(user.id, user);
    }

    // Extract and save hashtags
    await this.extractAndSaveHashtags(tweet.id, insertTweet.content);

    return tweet;
  }

  async getUserTweets(userId: string, limit = 50): Promise<TweetWithAuthor[]> {
    const userTweets = Array.from(this.tweets.values())
      .filter(tweet => tweet.authorId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return userTweets.map(tweet => {
      const author = this.users.get(tweet.authorId);
      return {
        ...tweet,
        author: author!
      };
    });
  }

  async getTweetReplies(tweetId: string): Promise<TweetWithAuthor[]> {
    const replies = Array.from(this.tweets.values())
      .filter(tweet => tweet.parentTweetId === tweetId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return replies.map(tweet => {
      const author = this.users.get(tweet.authorId);
      return {
        ...tweet,
        author: author!
      };
    });
  }

  async searchTweets(query: string): Promise<TweetWithAuthor[]> {
    const lowerQuery = query.toLowerCase();
    const matchingTweets = Array.from(this.tweets.values())
      .filter(tweet => tweet.content.toLowerCase().includes(lowerQuery))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);

    return matchingTweets.map(tweet => {
      const author = this.users.get(tweet.authorId);
      return {
        ...tweet,
        author: author!
      };
    });
  }

  async getTrendingTweets(): Promise<TweetWithAuthor[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTweets = Array.from(this.tweets.values())
      .filter(tweet => tweet.createdAt > oneDayAgo)
      .sort((a, b) => {
        const scoreA = a.likes + a.retweets * 2 + a.replies * 1.5;
        const scoreB = b.likes + b.retweets * 2 + b.replies * 1.5;
        return scoreB - scoreA;
      })
      .slice(0, 50);

    return recentTweets.map(tweet => {
      const author = this.users.get(tweet.authorId);
      return {
        ...tweet,
        author: author!
      };
    });
  }

  // Likes
  async likeTweet(insertLike: InsertLike): Promise<Like> {
    const like: Like = {
      id: randomUUID(),
      createdAt: new Date(),
      ...insertLike,
    };
    this.likes.set(like.id, like);
    
    // Update tweet like count
    const tweet = this.tweets.get(insertLike.tweetId);
    if (tweet) {
      tweet.likes += 1;
      this.tweets.set(tweet.id, tweet);
    }

    return like;
  }

  async unlikeTweet(userId: string, tweetId: string): Promise<boolean> {
    const likeToRemove = Array.from(this.likes.values())
      .find(like => like.userId === userId && like.tweetId === tweetId);
    
    if (likeToRemove) {
      this.likes.delete(likeToRemove.id);
      
      // Update tweet like count
      const tweet = this.tweets.get(tweetId);
      if (tweet) {
        tweet.likes -= 1;
        this.tweets.set(tweet.id, tweet);
      }
      return true;
    }
    return false;
  }

  async isLiked(userId: string, tweetId: string): Promise<boolean> {
    return Array.from(this.likes.values())
      .some(like => like.userId === userId && like.tweetId === tweetId);
  }

  async getUserLikes(userId: string): Promise<TweetWithAuthor[]> {
    const userLikes = Array.from(this.likes.values())
      .filter(like => like.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return userLikes.map(like => {
      const tweet = this.tweets.get(like.tweetId);
      const author = tweet ? this.users.get(tweet.authorId) : null;
      return {
        ...tweet!,
        author: author!
      };
    });
  }

  // Follows
  async followUser(insertFollow: InsertFollow): Promise<Follow> {
    const follow: Follow = {
      id: randomUUID(),
      createdAt: new Date(),
      ...insertFollow,
    };
    this.follows.set(follow.id, follow);
    
    // Update follower/following counts
    const follower = this.users.get(insertFollow.followerId);
    const following = this.users.get(insertFollow.followingId);
    
    if (follower) {
      follower.following += 1;
      this.users.set(follower.id, follower);
    }
    
    if (following) {
      following.followers += 1;
      this.users.set(following.id, following);
    }

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const followToRemove = Array.from(this.follows.values())
      .find(follow => follow.followerId === followerId && follow.followingId === followingId);
    
    if (followToRemove) {
      this.follows.delete(followToRemove.id);
      
      // Update follower/following counts
      const follower = this.users.get(followerId);
      const following = this.users.get(followingId);
      
      if (follower) {
        follower.following -= 1;
        this.users.set(follower.id, follower);
      }
      
      if (following) {
        following.followers -= 1;
        this.users.set(following.id, following);
      }
      return true;
    }
    return false;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return Array.from(this.follows.values())
      .some(follow => follow.followerId === followerId && follow.followingId === followingId);
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followers = Array.from(this.follows.values())
      .filter(follow => follow.followingId === userId)
      .map(follow => this.users.get(follow.followerId))
      .filter(user => user !== undefined) as User[];
    
    return followers;
  }

  async getFollowing(userId: string): Promise<User[]> {
    const following = Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId)
      .map(follow => this.users.get(follow.followingId))
      .filter(user => user !== undefined) as User[];
    
    return following;
  }

  async getSuggestedUsers(userId: string, limit = 10): Promise<User[]> {
    const followingIds = new Set(
      Array.from(this.follows.values())
        .filter(follow => follow.followerId === userId)
        .map(follow => follow.followingId)
    );
    followingIds.add(userId); // Don't suggest self

    return Array.from(this.users.values())
      .filter(user => !followingIds.has(user.id))
      .sort((a, b) => b.followers - a.followers)
      .slice(0, limit);
  }

  // Bookmarks
  async bookmarkTweet(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const bookmark: Bookmark = {
      id: randomUUID(),
      createdAt: new Date(),
      ...insertBookmark,
    };
    this.bookmarks.set(bookmark.id, bookmark);
    return bookmark;
  }

  async unbookmarkTweet(userId: string, tweetId: string): Promise<boolean> {
    const bookmarkToRemove = Array.from(this.bookmarks.values())
      .find(bookmark => bookmark.userId === userId && bookmark.tweetId === tweetId);
    
    if (bookmarkToRemove) {
      this.bookmarks.delete(bookmarkToRemove.id);
      return true;
    }
    return false;
  }

  async isBookmarked(userId: string, tweetId: string): Promise<boolean> {
    return Array.from(this.bookmarks.values())
      .some(bookmark => bookmark.userId === userId && bookmark.tweetId === tweetId);
  }

  async getUserBookmarks(userId: string): Promise<TweetWithAuthor[]> {
    const userBookmarks = Array.from(this.bookmarks.values())
      .filter(bookmark => bookmark.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return userBookmarks.map(bookmark => {
      const tweet = this.tweets.get(bookmark.tweetId);
      const author = tweet ? this.users.get(tweet.authorId) : null;
      return {
        ...tweet!,
        author: author!
      };
    });
  }

  // Retweets
  async retweetTweet(insertRetweet: InsertRetweet): Promise<Retweet> {
    const retweet: Retweet = {
      id: randomUUID(),
      createdAt: new Date(),
      ...insertRetweet,
    };
    this.retweets.set(retweet.id, retweet);
    
    // Update tweet retweet count
    const tweet = this.tweets.get(insertRetweet.tweetId);
    if (tweet) {
      tweet.retweets += 1;
      this.tweets.set(tweet.id, tweet);
    }

    return retweet;
  }

  async unretweetTweet(userId: string, tweetId: string): Promise<boolean> {
    const retweetToRemove = Array.from(this.retweets.values())
      .find(retweet => retweet.userId === userId && retweet.tweetId === tweetId);
    
    if (retweetToRemove) {
      this.retweets.delete(retweetToRemove.id);
      
      // Update tweet retweet count
      const tweet = this.tweets.get(tweetId);
      if (tweet) {
        tweet.retweets -= 1;
        this.tweets.set(tweet.id, tweet);
      }
      return true;
    }
    return false;
  }

  async isRetweeted(userId: string, tweetId: string): Promise<boolean> {
    return Array.from(this.retweets.values())
      .some(retweet => retweet.userId === userId && retweet.tweetId === tweetId);
  }

  async getUserRetweets(userId: string): Promise<TweetWithAuthor[]> {
    const userRetweets = Array.from(this.retweets.values())
      .filter(retweet => retweet.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return userRetweets.map(retweet => {
      const tweet = this.tweets.get(retweet.tweetId);
      const author = tweet ? this.users.get(tweet.authorId) : null;
      return {
        ...tweet!,
        author: author!
      };
    });
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      read: false,
      createdAt: new Date(),
      ...insertNotification,
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getUserNotifications(userId: string, limit = 50): Promise<NotificationWithUser[]> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return userNotifications.map(notification => ({
      ...notification,
      fromUser: notification.fromUserId ? this.users.get(notification.fromUserId) || null : null
    }));
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.notifications.set(notificationId, notification);
      return true;
    }
    return false;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    let updated = false;
    Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .forEach(notification => {
        notification.read = true;
        this.notifications.set(notification.id, notification);
        updated = true;
      });
    return updated;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .length;
  }

  // Direct Messages
  async createConversation(participantIds: string[]): Promise<Conversation> {
    const conversation: Conversation = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(conversation.id, conversation);

    // Add participants
    participantIds.forEach(userId => {
      const participant: ConversationParticipant = {
        id: randomUUID(),
        conversationId: conversation.id,
        userId,
        joinedAt: new Date(),
      };
      this.conversationParticipants.set(participant.id, participant);
    });

    return conversation;
  }

  async getOrCreateConversation(participantIds: string[]): Promise<Conversation> {
    // Try to find existing conversation with same participants
    const participantSet = new Set(participantIds);
    
    for (const conversation of this.conversations.values()) {
      const conversationParticipants = Array.from(this.conversationParticipants.values())
        .filter(cp => cp.conversationId === conversation.id);
      
      if (conversationParticipants.length === participantIds.length &&
          conversationParticipants.every(cp => participantSet.has(cp.userId))) {
        return conversation;
      }
    }

    return await this.createConversation(participantIds);
  }

  async getUserConversations(userId: string): Promise<ConversationWithParticipants[]> {
    const userParticipations = Array.from(this.conversationParticipants.values())
      .filter(cp => cp.userId === userId);

    return userParticipations.map(cp => {
      const conversation = this.conversations.get(cp.conversationId)!;
      const participants = Array.from(this.conversationParticipants.values())
        .filter(participant => participant.conversationId === cp.conversationId)
        .map(participant => ({
          ...participant,
          user: this.users.get(participant.userId)!
        }));

      const lastMessage = Array.from(this.directMessages.values())
        .filter(message => message.conversationId === cp.conversationId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      return {
        ...conversation,
        participants,
        lastMessage: lastMessage ? {
          ...lastMessage,
          sender: this.users.get(lastMessage.senderId)!
        } : undefined
      };
    });
  }

  async sendDirectMessage(insertMessage: InsertDirectMessage): Promise<DirectMessage> {
    const message: DirectMessage = {
      id: randomUUID(),
      content: null,
      images: null,
      read: false,
      createdAt: new Date(),
      ...insertMessage,
    };
    this.directMessages.set(message.id, message);
    
    // Update conversation timestamp
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
      this.conversations.set(conversation.id, conversation);
    }

    return message;
  }

  async getConversationMessages(conversationId: string, limit = 50): Promise<DirectMessageWithSender[]> {
    const messages = Array.from(this.directMessages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return messages.map(message => ({
      ...message,
      sender: this.users.get(message.senderId)!
    }));
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    let updated = false;
    Array.from(this.directMessages.values())
      .filter(message => message.conversationId === conversationId && 
                        message.senderId !== userId && !message.read)
      .forEach(message => {
        message.read = true;
        this.directMessages.set(message.id, message);
        updated = true;
      });
    return updated;
  }

  // Trending & Hashtags
  async getTrendingTopics(region = "global", limit = 10): Promise<TrendingTopic[]> {
    return Array.from(this.trendingTopics.values())
      .filter(topic => topic.region === region)
      .sort((a, b) => b.tweetCount - a.tweetCount)
      .slice(0, limit);
  }

  async updateTrendingTopics(): Promise<void> {
    // This would typically be run as a background job
    // For now, we'll keep the seeded data
  }

  async extractAndSaveHashtags(tweetId: string, content: string): Promise<void> {
    const hashtagPattern = /#(\w+)/g;
    const matches = content.match(hashtagPattern);
    
    if (!matches) return;

    for (const match of matches) {
      const tag = match.slice(1).toLowerCase(); // Remove # and convert to lowercase
      
      // Find or create hashtag
      let hashtag = Array.from(this.hashtags.values()).find(h => h.tag === tag);
      
      if (hashtag) {
        hashtag.useCount += 1;
        this.hashtags.set(hashtag.id, hashtag);
      } else {
        hashtag = {
          id: randomUUID(),
          tag,
          useCount: 1,
          createdAt: new Date(),
        };
        this.hashtags.set(hashtag.id, hashtag);
      }
    }
  }
}

export const storage = new MemStorage();