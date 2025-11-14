# Database Schema for Google Beet

## SQL Schema

Copy and paste the following SQL commands into your Supabase SQL editor to create the necessary tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE public.meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting participants table
CREATE TABLE public.meeting_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(meeting_id, user_id)
);

-- Indexes for better performance
CREATE INDEX idx_meetings_code ON public.meetings(meeting_code);
CREATE INDEX idx_meetings_host ON public.meetings(host_id);
CREATE INDEX idx_participants_meeting ON public.meeting_participants(meeting_id);
CREATE INDEX idx_participants_user ON public.meeting_participants(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Policies for meetings table
CREATE POLICY "Anyone can view active meetings" 
  ON public.meetings FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can create meetings" 
  ON public.meetings FOR INSERT 
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their meetings" 
  ON public.meetings FOR UPDATE 
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their meetings" 
  ON public.meetings FOR DELETE 
  USING (auth.uid() = host_id);

-- Policies for meeting_participants table
CREATE POLICY "Anyone can view meeting participants" 
  ON public.meeting_participants FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can join meetings" 
  ON public.meeting_participants FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" 
  ON public.meeting_participants FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_meeting_updated
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## Tables Overview

### 1. profiles
- Stores user profile information
- Extends Supabase auth.users
- Fields: id, email, full_name, avatar_url, created_at, updated_at

### 2. meetings
- Stores meeting information
- Fields: id, meeting_code (unique), title, host_id, is_active, created_at, updated_at

### 3. meeting_participants
- Tracks who joined which meeting and when
- Fields: id, meeting_id, user_id, joined_at, left_at

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire SQL schema above
4. Run the query
5. Verify that all tables, policies, and triggers were created successfully
