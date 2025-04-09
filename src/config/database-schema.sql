-- This file represents the database schema that would be set up in Nhost/Hasura
-- It's not executed directly but serves as documentation for the data structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles
-- Extends the default Nhost auth.users table with additional profile information
CREATE TABLE "public"."user_profiles" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES "auth"."users"(id) ON DELETE CASCADE,
    "full_name" text,
    "avatar_url" text,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    UNIQUE("user_id")
);

-- User Preferences
-- Stores user preferences for news content
CREATE TABLE "public"."user_preferences" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES "auth"."users"(id) ON DELETE CASCADE,
    "topics" jsonb DEFAULT '[]',
    "keywords" jsonb DEFAULT '[]',
    "preferred_sources" jsonb DEFAULT '[]',
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    UNIQUE("user_id")
);

-- Articles (Processed by AI)
CREATE TABLE "public"."articles" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" text NOT NULL,
    "content" text NOT NULL,
    "summary" text NOT NULL,
    "source" text NOT NULL,
    "url" text NOT NULL,
    "image_url" text,
    "author" text,
    "published_at" timestamptz NOT NULL,
    "sentiment_label" text CHECK (sentiment_label IN ('positive', 'negative', 'neutral')),
    "sentiment_explanation" text,
    "processed_at" timestamptz DEFAULT now(),
    UNIQUE("url")
);

-- Bookmarks
CREATE TABLE "public"."bookmarks" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES "auth"."users"(id) ON DELETE CASCADE,
    "article_id" uuid NOT NULL REFERENCES "public"."articles"(id) ON DELETE CASCADE,
    "created_at" timestamptz DEFAULT now(),
    UNIQUE("user_id", "article_id")
);

-- Enable Row Level Security
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."bookmarks" ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS
CREATE POLICY "Users can view their own profile"
    ON "public"."user_profiles"
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON "public"."user_profiles"
    FOR UPDATE
    USING (auth.uid() = user_id);

-- User Preferences RLS
CREATE POLICY "Users can view their own preferences"
    ON "public"."user_preferences"
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
    ON "public"."user_preferences"
    FOR ALL
    USING (auth.uid() = user_id);

-- Bookmarks RLS
CREATE POLICY "Users can view their own bookmarks"
    ON "public"."bookmarks"
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks"
    ON "public"."bookmarks"
    FOR ALL
    USING (auth.uid() = user_id);

-- Public Access Policy
CREATE POLICY "Anyone can view articles"
    ON "public"."articles"
    FOR SELECT
    USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_articles_published_at ON articles (published_at);
CREATE INDEX idx_articles_sentiment ON articles (sentiment_label);
CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences (user_id); 