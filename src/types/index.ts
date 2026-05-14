export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  phone?: string;
  avatar_url?: string;
  device_fingerprint?: string;
  is_banned: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  price: number;
  teacher_id: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  teacher?: User;
  video_count?: number;
  enrollment_count?: number;
}

export interface Video {
  id: string;
  course_id: string;
  title: string;
  description: string;
  youtube_url_encrypted: string;
  youtube_video_id: string;
  order_num: number;
  visibility: 'public' | 'private' | 'enrolled';
  category: 'lecture' | 'practice' | 'test' | 'notes' | 'revision';
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'pending' | 'active' | 'revoked';
  created_at: string;
  updated_at: string;
  course?: Course;
  student?: User;
}

export interface VideoProgress {
  id: string;
  student_id: string;
  video_id: string;
  watched_seconds: number;
  is_completed: boolean;
  last_watched_at: string;
  video?: Video;
}

export interface LiveSession {
  id: string;
  teacher_id: string;
  course_id: string;
  title: string;
  description: string;
  youtube_live_url_encrypted: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  teacher?: User;
  course?: Course;
}

export interface ChatMessage {
  id: string;
  live_session_id: string;
  user_id: string;
  message: string;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'live' | 'video' | 'announcement';
  course_id?: string;
  sent_by: string;
  created_at: string;
  sender?: User;
}

export interface UserNotification {
  id: string;
  user_id: string;
  notification_id: string;
  is_read: boolean;
  created_at: string;
  notification?: Notification;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface VideoToken {
  id: string;
  video_id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface OTPState {
  email: string;
  otp: string;
  expires_at: string;
  attempts: number;
}