import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  verified: boolean("verified").default(false),
  bio: text("bio"),
  following: integer("following").default(0),
  followers: integer("followers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tweets = pgTable("tweets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  image: text("image"),
  likes: integer("likes").default(0),
  retweets: integer("retweets").default(0),
  replies: integer("replies").default(0),
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTweetSchema = createInsertSchema(tweets).omit({
  id: true,
  createdAt: true,
  likes: true,
  retweets: true,
  replies: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type Tweet = typeof tweets.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Follow = typeof follows.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTweet = z.infer<typeof insertTweetSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type TweetWithAuthor = Tweet & {
  author: User;
  isLiked?: boolean;
  isRetweeted?: boolean;
};
