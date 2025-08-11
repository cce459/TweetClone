import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  avatar: text("avatar"),
  headerImage: text("header_image"),
  verified: boolean("verified").default(false),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  birthDate: timestamp("birth_date"),
  following: integer("following").default(0),
  followers: integer("followers").default(0),
  tweetsCount: integer("tweets_count").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tweets = pgTable("tweets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  parentTweetId: varchar("parent_tweet_id").references(() => tweets.id), // For replies
  images: text("images").array(), // Multiple images support
  video: text("video"),
  gif: text("gif"),
  poll: json("poll"), // Poll data
  likes: integer("likes").default(0),
  retweets: integer("retweets").default(0),
  replies: integer("replies").default(0),
  views: integer("views").default(0),
  isRetweet: boolean("is_retweet").default(false),
  retweetOfId: varchar("retweet_of_id").references(() => tweets.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tweetId: varchar("tweet_id").notNull().references(() => tweets.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 북마크 테이블
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tweetId: varchar("tweet_id").notNull().references(() => tweets.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 리트윗 테이블
export const retweets = pgTable("retweets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tweetId: varchar("tweet_id").notNull().references(() => tweets.id),
  comment: text("comment"), // Quote tweet comment
  createdAt: timestamp("created_at").defaultNow(),
});

// 알림 테이블
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fromUserId: varchar("from_user_id").references(() => users.id),
  type: text("type").notNull(), // 'like', 'retweet', 'follow', 'reply', 'mention'
  entityId: varchar("entity_id"), // tweet id, user id, etc
  message: text("message"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 다이렉트 메시지 대화방
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 대화 참여자
export const conversationParticipants = pgTable("conversation_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// 다이렉트 메시지
export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content"),
  images: text("images").array(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 트렌딩 토픽
export const trendingTopics = pgTable("trending_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: text("topic").notNull(),
  category: text("category"),
  tweetCount: integer("tweet_count").default(0),
  region: text("region").default("global"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 해시태그
export const hashtags = pgTable("hashtags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tag: text("tag").notNull().unique(),
  useCount: integer("use_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// 트윗-해시태그 관계
export const tweetHashtags = pgTable("tweet_hashtags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tweetId: varchar("tweet_id").notNull().references(() => tweets.id),
  hashtagId: varchar("hashtag_id").notNull().references(() => hashtags.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 관계 정의
export const userRelations = relations(users, ({ many }) => ({
  tweets: many(tweets),
  likes: many(likes),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  bookmarks: many(bookmarks),
  retweets: many(retweets),
  notifications: many(notifications),
  sentMessages: many(directMessages),
}));

export const tweetRelations = relations(tweets, ({ one, many }) => ({
  author: one(users, { fields: [tweets.authorId], references: [users.id] }),
  parentTweet: one(tweets, { fields: [tweets.parentTweetId], references: [tweets.id] }),
  retweetOf: one(tweets, { fields: [tweets.retweetOfId], references: [tweets.id] }),
  likes: many(likes),
  retweets: many(retweets),
  bookmarks: many(bookmarks),
  replies: many(tweets, { relationName: "parent" }),
  hashtags: many(tweetHashtags),
}));

export const likeRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
  tweet: one(tweets, { fields: [likes.tweetId], references: [tweets.id] }),
}));

export const followRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: "follower" }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: "following" }),
}));

export const bookmarkRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  tweet: one(tweets, { fields: [bookmarks.tweetId], references: [tweets.id] }),
}));

export const retweetRelations = relations(retweets, ({ one }) => ({
  user: one(users, { fields: [retweets.userId], references: [users.id] }),
  tweet: one(tweets, { fields: [retweets.tweetId], references: [tweets.id] }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  fromUser: one(users, { fields: [notifications.fromUserId], references: [users.id] }),
}));

export const conversationRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(directMessages),
}));

export const conversationParticipantRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, { fields: [conversationParticipants.conversationId], references: [conversations.id] }),
  user: one(users, { fields: [conversationParticipants.userId], references: [users.id] }),
}));

export const directMessageRelations = relations(directMessages, ({ one }) => ({
  conversation: one(conversations, { fields: [directMessages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [directMessages.senderId], references: [users.id] }),
}));

export const hashtagRelations = relations(hashtags, ({ many }) => ({
  tweets: many(tweetHashtags),
}));

export const tweetHashtagRelations = relations(tweetHashtags, ({ one }) => ({
  tweet: one(tweets, { fields: [tweetHashtags.tweetId], references: [tweets.id] }),
  hashtag: one(hashtags, { fields: [tweetHashtags.hashtagId], references: [hashtags.id] }),
}));

// Insert 스키마들
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  joinedAt: true,
});

export const insertTweetSchema = createInsertSchema(tweets).omit({
  id: true,
  createdAt: true,
  likes: true,
  retweets: true,
  replies: true,
  views: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertRetweetSchema = createInsertSchema(retweets).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({
  id: true,
  createdAt: true,
});

// 타입 정의들
export type User = typeof users.$inferSelect;
export type Tweet = typeof tweets.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Retweet = typeof retweets.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type DirectMessage = typeof directMessages.$inferSelect;
export type TrendingTopic = typeof trendingTopics.$inferSelect;
export type Hashtag = typeof hashtags.$inferSelect;
export type TweetHashtag = typeof tweetHashtags.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTweet = z.infer<typeof insertTweetSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type InsertRetweet = z.infer<typeof insertRetweetSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;

// 복합 타입들
export type TweetWithAuthor = Tweet & {
  author: User;
  isLiked?: boolean;
  isRetweeted?: boolean;
  isBookmarked?: boolean;
  parentTweet?: Tweet;
  retweetOf?: Tweet & { author: User };
};

export type NotificationWithUser = Notification & {
  fromUser: User | null;
};

export type ConversationWithParticipants = Conversation & {
  participants: (ConversationParticipant & { user: User })[];
  lastMessage?: DirectMessage & { sender: User };
};

export type DirectMessageWithSender = DirectMessage & {
  sender: User;
};
