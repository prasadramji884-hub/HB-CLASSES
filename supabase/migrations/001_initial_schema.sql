-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  device_fingerprint TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  teacher_id UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url_encrypted TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  order_num INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'enrolled' CHECK (visibility IN ('public', 'private', 'enrolled')),
  category TEXT DEFAULT 'lecture' CHECK (category IN ('lecture', 'practice', 'test', 'notes', 'revision')),
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Live Sessions table
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  youtube_live_url_encrypted TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Progress table
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, video_id)
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  live_session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'live', 'video', 'announcement')),
  course_id UUID REFERENCES courses(id),
  sent_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);

-- Video Tokens table
CREATE TABLE IF NOT EXISTS video_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for service role, restrict for anon)
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON live_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON video_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON user_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON video_tokens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for specific tables
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
ALTER TABLE live_sessions REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_videos_course ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_student ON video_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(live_session_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_video_tokens_token ON video_tokens(token);

-- Insert default admin (password will be set via app)
INSERT INTO users (email, name, role, is_approved, is_banned)
VALUES ('admin@hbclasses.com', 'Super Admin', 'admin', TRUE, FALSE)
ON CONFLICT (email) DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (key, value) VALUES
('institute_name', 'HB CLASSES'),
('maintenance_mode', 'false'),
('default_theme', 'dark')
ON CONFLICT (key) DO NOTHING;