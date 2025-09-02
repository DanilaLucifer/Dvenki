export interface User {
  id: string
  email: string
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  description: string | null
  type: string
  cover_image: string | null
  prompt_text: string | null
  is_public: boolean
  created_by: string | null
  created_at: string
}

export interface Journal {
  id: string
  user_id: string
  template_id: string | null
  title: string
  description: string | null
  cover_image: string | null
  visibility: 'private' | 'friends' | 'public'
  created_at: string
  updated_at: string
}

export interface Entry {
  id: string
  journal_id: string
  user_id: string
  title: string | null
  content: string
  entry_date: string
  mood: number | null
  images: string[] | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
}

export interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  daily_reminders: boolean
  weekly_summary: boolean
  reminder_time: string
}

export interface DashboardView {
  id: string
  label: string
  icon: string
  description: string
}

// Новые типы для лайков и комментариев
export interface Like {
  id: string
  user_id: string
  entry_id: string
  is_like: boolean
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  entry_id: string
  content: string
  created_at: string
  updated_at: string
}

// Расширенные типы для отображения
export interface EntryWithDetails extends Entry {
  journal?: Journal
  profile?: Profile
  likes_count?: number
  dislikes_count?: number
  comments_count?: number
  user_like?: boolean | null // null - не лайкал, true - лайк, false - дизлайк
}

export interface JournalWithDetails extends Journal {
  profile?: Profile
  entries_count?: number
  template?: Template
}

export interface ProfileWithStats extends Profile {
  journals_count?: number
  entries_count?: number
  friends_count?: number
}

// Типы для публичной ленты
export interface PublicFeedItem {
  entry: EntryWithDetails
  journal: Journal
  profile: Profile
  likes_count: number
  dislikes_count: number
  comments_count: number
  user_like: boolean | null
  is_bookmarked: boolean
}

// Типы для поиска и фильтрации
export interface SearchFilters {
  query: string
  type: string
  visibility: string
  date_from: string | null
  date_to: string | null
  mood: number | null
}

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

// Типы для уведомлений
export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'friendship_request' | 'friendship_accepted' | 'reminder'
  title: string
  message: string
  data: Record<string, any>
  is_read: boolean
  created_at: string
}

// Типы для статистики
export interface UserStats {
  total_journals: number
  total_entries: number
  total_likes_received: number
  total_comments_received: number
  total_friends: number
  streak_days: number
  last_entry_date: string | null
}

// Типы для настроек пользователя
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'ru' | 'en'
  timezone: string
  date_format: 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  privacy_level: 'public' | 'friends' | 'private'
  email_frequency: 'daily' | 'weekly' | 'monthly' | 'never'
}
