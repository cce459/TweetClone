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
  type DirectMessageWithSender,
  users,
  tweets,
  likes,
  follows,
  bookmarks,
  retweets,
  notifications,
  directMessages,
  conversations,
  conversationParticipants,
  trendingTopics,
  hashtags,
  tweetHashtags
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";
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

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    try {
      // Check if users already exist
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) return;

      // Create initial users
      const seedUsers = [
        {
          id: "user1",
          username: "sarahjohnson",
          name: "Sarah Johnson",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c3c918?w=100&h=100&fit=crop&crop=face",
          verified: false,
          bio: "Software developer passionate about TypeScript and React",
          location: "San Francisco, CA",
          website: "https://sarahjohnson.dev",
          following: 245,
          followers: 1200,
          tweetsCount: 89,
        },
        {
          id: "user2", 
          username: "alexchen",
          name: "Alex Chen",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          verified: false,
          bio: "Full-stack engineer building the future",
          location: "New York, NY",
          following: 180,
          followers: 850,
          tweetsCount: 156,
        },
        {
          id: "user3",
          username: "emmarodriguez", 
          name: "Emma Rodriguez",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
          verified: true,
          bio: "UX Designer | Tech enthusiast | Coffee lover",
          location: "Austin, TX",
          website: "https://emmarodriguez.design",
          following: 320,
          followers: 2100,
          tweetsCount: 234,
        },
        {
          id: "user4",
          username: "davidkim",
          name: "David Kim",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          verified: false,
          bio: "JavaScript developer and open source contributor",
          location: "Seattle, WA",
          website: "https://github.com/davidkim",
          following: 150,
          followers: 680,
          tweetsCount: 78,
        },
        {
          id: "user5",
          username: "lisawang",
          name: "Lisa Wang",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
          verified: true,
          bio: "Startup founder | Building the next big thing",
          location: "Los Angeles, CA",
          website: "https://lisawang.co",
          following: 500,
          followers: 5200,
          tweetsCount: 445,
        },
      ];

      await db.insert(users).values(seedUsers);

      // Create initial tweets
      const seedTweets = [
        {
          id: "tweet1",
          content: "Just finished implementing a new authentication system using TypeScript and modern web APIs. The type safety really makes a difference in catching errors early! 🚀 #WebDev #TypeScript",
          authorId: "user2",
          images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop"],
          likes: 45,
          retweets: 8,
          replies: 12,
          views: 1240,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "tweet2",
          content: "The new dark mode implementation is looking amazing! 🌙 The contrast ratios are perfect and it's so much easier on the eyes. Props to the design team for nailing the accessibility standards.",
          authorId: "user3",
          likes: 89,
          retweets: 15,
          replies: 23,
          views: 2340,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: "tweet3",
          content: "Hot take: TypeScript's strict mode should be enabled by default in all new projects. The initial learning curve is worth the long-term benefits in maintainability and bug prevention. 🔥",
          authorId: "user4",
          likes: 234,
          retweets: 67,
          replies: 156,
          views: 5670,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
        {
          id: "tweet4",
          content: "Just launched our new social platform built entirely with modern web technologies! The responsive design works seamlessly across all devices. Proud of what our small team accomplished 💪",
          authorId: "user5",
          images: ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"],
          likes: 412,
          retweets: 156,
          replies: 89,
          views: 8900,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        },
      ];

      await db.insert(tweets).values(seedTweets);

      // Create some trending topics
      const seedTrending = [
        {
          id: "trend1",
          topic: "#TypeScript",
          category: "Technology",
          tweetCount: 42100,
          region: "global",
        },
        {
          id: "trend2", 
          topic: "#ResponsiveDesign",
          category: "Web Development",
          tweetCount: 28500,
          region: "global",
        },
        {
          id: "trend3",
          topic: "JavaScript Frameworks",
          category: "Technology",
          tweetCount: 18300,
          region: "global",
        },
        {
          id: "trend4",
          topic: "#DarkMode",
          category: "Design",
          tweetCount: 15700,
          region: "global",
        },
      ];

      await db.insert(trendingTopics).values(seedTrending);

      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Failed to seed database:", error);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async searchUsers(query: string): Promise<User[]> {
    return await db.select().from(users)
      .where(
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.username, `%${query}%`),
          ilike(users.bio, `%${query}%`)
        )
      )
      .limit(20);
  }

  // Tweets
  async getTweets(limit = 50, offset = 0): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .orderBy(desc(tweets.createdAt))
    .limit(limit)
    .offset(offset);

    return result.map(row => ({
      ...row.tweet,
      author: row.author!
    }));
  }

  async getTweet(id: string): Promise<TweetWithAuthor | undefined> {
    const result = await db.select({
      tweet: tweets,
      author: users
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(eq(tweets.id, id))
    .limit(1);

    if (!result[0]) return undefined;
    
    return {
      ...result[0].tweet,
      author: result[0].author!
    };
  }

  async createTweet(insertTweet: InsertTweet): Promise<Tweet> {
    const result = await db.insert(tweets).values(insertTweet).returning();
    const tweet = result[0];

    // Update user's tweet count
    await db.update(users)
      .set({ 
        tweetsCount: sql`${users.tweetsCount} + 1`
      })
      .where(eq(users.id, insertTweet.authorId));

    // Extract and save hashtags
    await this.extractAndSaveHashtags(tweet.id, insertTweet.content);

    return tweet;
  }

  async getUserTweets(userId: string, limit = 50): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(eq(tweets.authorId, userId))
    .orderBy(desc(tweets.createdAt))
    .limit(limit);

    return result.map(row => ({
      ...row.tweet,
      author: row.author!
    }));
  }

  async getTweetReplies(tweetId: string): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(eq(tweets.parentTweetId, tweetId))
    .orderBy(desc(tweets.createdAt));

    return result.map(row => ({
      ...row.tweet,
      author: row.author!
    }));
  }

  async searchTweets(query: string): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(ilike(tweets.content, `%${query}%`))
    .orderBy(desc(tweets.createdAt))
    .limit(50);

    return result.map(row => ({
      ...row.tweet,
      author: row.author!
    }));
  }

  async getTrendingTweets(): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users
    })
    .from(tweets)
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(sql`${tweets.createdAt} > NOW() - INTERVAL '24 hours'`)
    .orderBy(desc(sql`${tweets.likes} + ${tweets.retweets} * 2 + ${tweets.replies} * 1.5`))
    .limit(50);

    return result.map(row => ({
      ...row.tweet,
      author: row.author!
    }));
  }

  // Likes
  async likeTweet(insertLike: InsertLike): Promise<Like> {
    const result = await db.insert(likes).values(insertLike).returning();
    
    // Update tweet like count
    await db.update(tweets)
      .set({ likes: sql`${tweets.likes} + 1` })
      .where(eq(tweets.id, insertLike.tweetId));

    return result[0];
  }

  async unlikeTweet(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.tweetId, tweetId)))
      .returning();

    if (result.length > 0) {
      // Update tweet like count
      await db.update(tweets)
        .set({ likes: sql`${tweets.likes} - 1` })
        .where(eq(tweets.id, tweetId));
      return true;
    }
    return false;
  }

  async isLiked(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.tweetId, tweetId)))
      .limit(1);
    return result.length > 0;
  }

  async getUserLikes(userId: string): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users
    })
    .from(likes)
    .leftJoin(tweets, eq(likes.tweetId, tweets.id))
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(eq(likes.userId, userId))
    .orderBy(desc(likes.createdAt));

    return result.map(row => ({
      ...row.tweet!,
      author: row.author!
    }));
  }

  // Follows
  async followUser(insertFollow: InsertFollow): Promise<Follow> {
    const result = await db.insert(follows).values(insertFollow).returning();
    
    // Update follower/following counts
    await db.update(users)
      .set({ following: sql`${users.following} + 1` })
      .where(eq(users.id, insertFollow.followerId));

    await db.update(users)
      .set({ followers: sql`${users.followers} + 1` })
      .where(eq(users.id, insertFollow.followingId));

    return result[0];
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const result = await db.delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .returning();

    if (result.length > 0) {
      // Update follower/following counts
      await db.update(users)
        .set({ following: sql`${users.following} - 1` })
        .where(eq(users.id, followerId));

      await db.update(users)
        .set({ followers: sql`${users.followers} - 1` })
        .where(eq(users.id, followingId));
      return true;
    }
    return false;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await db.select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);
    return result.length > 0;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const result = await db.select({
      user: users
    })
    .from(follows)
    .leftJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, userId));

    return result.map(row => row.user!);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const result = await db.select({
      user: users
    })
    .from(follows)
    .leftJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, userId));

    return result.map(row => row.user!);
  }

  async getSuggestedUsers(userId: string, limit = 10): Promise<User[]> {
    // Get users that are not followed by the current user and exclude self
    const followingIds = await db.select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const followingSet = new Set(followingIds.map(f => f.id));
    followingSet.add(userId); // Don't suggest self

    const allUsers = await db.select()
      .from(users)
      .orderBy(desc(users.followers))
      .limit(limit * 2); // Get more to filter out followed users

    return allUsers
      .filter(user => !followingSet.has(user.id))
      .slice(0, limit);
  }

  // Bookmarks
  async bookmarkTweet(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const result = await db.insert(bookmarks).values(insertBookmark).returning();
    return result[0];
  }

  async unbookmarkTweet(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.tweetId, tweetId)))
      .returning();
    return result.length > 0;
  }

  async isBookmarked(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.tweetId, tweetId)))
      .limit(1);
    return result.length > 0;
  }

  async getUserBookmarks(userId: string): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users
    })
    .from(bookmarks)
    .leftJoin(tweets, eq(bookmarks.tweetId, tweets.id))
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));

    return result.map(row => ({
      ...row.tweet!,
      author: row.author!
    }));
  }

  // Retweets
  async retweetTweet(insertRetweet: InsertRetweet): Promise<Retweet> {
    const result = await db.insert(retweets).values(insertRetweet).returning();
    
    // Update tweet retweet count
    await db.update(tweets)
      .set({ retweets: sql`${tweets.retweets} + 1` })
      .where(eq(tweets.id, insertRetweet.tweetId));

    return result[0];
  }

  async unretweetTweet(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.delete(retweets)
      .where(and(eq(retweets.userId, userId), eq(retweets.tweetId, tweetId)))
      .returning();

    if (result.length > 0) {
      // Update tweet retweet count
      await db.update(tweets)
        .set({ retweets: sql`${tweets.retweets} - 1` })
        .where(eq(tweets.id, tweetId));
      return true;
    }
    return false;
  }

  async isRetweeted(userId: string, tweetId: string): Promise<boolean> {
    const result = await db.select()
      .from(retweets)
      .where(and(eq(retweets.userId, userId), eq(retweets.tweetId, tweetId)))
      .limit(1);
    return result.length > 0;
  }

  async getUserRetweets(userId: string): Promise<TweetWithAuthor[]> {
    const result = await db.select({
      tweet: tweets,
      author: users
    })
    .from(retweets)
    .leftJoin(tweets, eq(retweets.tweetId, tweets.id))
    .leftJoin(users, eq(tweets.authorId, users.id))
    .where(eq(retweets.userId, userId))
    .orderBy(desc(retweets.createdAt));

    return result.map(row => ({
      ...row.tweet!,
      author: row.author!
    }));
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }

  async getUserNotifications(userId: string, limit = 50): Promise<NotificationWithUser[]> {
    const result = await db.select({
      notification: notifications,
      fromUser: users
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.fromUserId, users.id))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

    return result.map(row => ({
      ...row.notification,
      fromUser: row.fromUser
    }));
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const result = await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId))
      .returning();
    return result.length > 0;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const result = await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId))
      .returning();
    return result.length > 0;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result[0]?.count || 0;
  }

  // Direct Messages
  async createConversation(participantIds: string[]): Promise<Conversation> {
    const result = await db.insert(conversations).values({}).returning();
    const conversation = result[0];

    // Add participants
    const participantValues = participantIds.map(userId => ({
      conversationId: conversation.id,
      userId
    }));
    await db.insert(conversationParticipants).values(participantValues);

    return conversation;
  }

  async getOrCreateConversation(participantIds: string[]): Promise<Conversation> {
    // Try to find existing conversation with same participants
    const existingConversations = await db.select()
      .from(conversationParticipants)
      .where(sql`${conversationParticipants.userId} IN (${participantIds.map(id => `'${id}'`).join(',')})`);

    // Group by conversation and check if all participants match
    const conversationParticipantCounts: { [key: string]: number } = {};
    existingConversations.forEach(cp => {
      conversationParticipantCounts[cp.conversationId] = (conversationParticipantCounts[cp.conversationId] || 0) + 1;
    });

    const matchingConversation = Object.keys(conversationParticipantCounts)
      .find(convId => conversationParticipantCounts[convId] === participantIds.length);

    if (matchingConversation) {
      const result = await db.select().from(conversations).where(eq(conversations.id, matchingConversation)).limit(1);
      return result[0];
    }

    return await this.createConversation(participantIds);
  }

  async getUserConversations(userId: string): Promise<ConversationWithParticipants[]> {
    const userConversations = await db.select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));

    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (cp) => {
        const conversation = await db.select().from(conversations).where(eq(conversations.id, cp.conversationId)).limit(1);
        const participants = await db.select({
          participant: conversationParticipants,
          user: users
        })
        .from(conversationParticipants)
        .leftJoin(users, eq(conversationParticipants.userId, users.id))
        .where(eq(conversationParticipants.conversationId, cp.conversationId));

        const lastMessage = await db.select({
          message: directMessages,
          sender: users
        })
        .from(directMessages)
        .leftJoin(users, eq(directMessages.senderId, users.id))
        .where(eq(directMessages.conversationId, cp.conversationId))
        .orderBy(desc(directMessages.createdAt))
        .limit(1);

        return {
          ...conversation[0],
          participants: participants.map(p => ({
            ...p.participant,
            user: p.user!
          })),
          lastMessage: lastMessage[0] ? {
            ...lastMessage[0].message,
            sender: lastMessage[0].sender!
          } : undefined
        };
      })
    );

    return conversationsWithDetails;
  }

  async sendDirectMessage(insertMessage: InsertDirectMessage): Promise<DirectMessage> {
    const result = await db.insert(directMessages).values(insertMessage).returning();
    
    // Update conversation timestamp
    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, insertMessage.conversationId));

    return result[0];
  }

  async getConversationMessages(conversationId: string, limit = 50): Promise<DirectMessageWithSender[]> {
    const result = await db.select({
      message: directMessages,
      sender: users
    })
    .from(directMessages)
    .leftJoin(users, eq(directMessages.senderId, users.id))
    .where(eq(directMessages.conversationId, conversationId))
    .orderBy(desc(directMessages.createdAt))
    .limit(limit);

    return result.map(row => ({
      ...row.message,
      sender: row.sender!
    }));
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    const result = await db.update(directMessages)
      .set({ read: true })
      .where(and(
        eq(directMessages.conversationId, conversationId),
        sql`${directMessages.senderId} != ${userId}`
      ))
      .returning();
    return result.length > 0;
  }

  // Trending & Hashtags
  async getTrendingTopics(region = "global", limit = 10): Promise<TrendingTopic[]> {
    return await db.select()
      .from(trendingTopics)
      .where(eq(trendingTopics.region, region))
      .orderBy(desc(trendingTopics.tweetCount))
      .limit(limit);
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
      
      // Insert or update hashtag
      const existingHashtag = await db.select()
        .from(hashtags)
        .where(eq(hashtags.tag, tag))
        .limit(1);

      let hashtagId: string;
      
      if (existingHashtag.length > 0) {
        // Update use count
        await db.update(hashtags)
          .set({ useCount: sql`${hashtags.useCount} + 1` })
          .where(eq(hashtags.id, existingHashtag[0].id));
        hashtagId = existingHashtag[0].id;
      } else {
        // Create new hashtag
        const result = await db.insert(hashtags)
          .values({ tag, useCount: 1 })
          .returning();
        hashtagId = result[0].id;
      }

      // Link tweet to hashtag
      await db.insert(tweetHashtags)
        .values({ tweetId, hashtagId })
        .onConflictDoNothing();
    }
  }
}

export const storage = new DatabaseStorage();
