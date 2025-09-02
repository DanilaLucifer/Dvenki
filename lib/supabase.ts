import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          cover_image?: string | null
          prompt_text?: string | null
          is_public?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          cover_image?: string | null
          prompt_text?: string | null
          is_public?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      journals: {
        Row: {
          id: string
          user_id: string
          template_id: string | null
          title: string
          description: string | null
          cover_image: string | null
          visibility: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id?: string | null
          title: string
          description?: string | null
          cover_image?: string | null
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string | null
          title?: string
          description?: string | null
          cover_image?: string | null
          visibility?: string
          created_at?: string
          updated_at?: string
        }
      }
      entries: {
        Row: {
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
        Insert: {
          id?: string
          journal_id: string
          user_id: string
          title?: string | null
          content: string
          entry_date?: string
          mood?: number | null
          images?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          journal_id?: string
          user_id?: string
          title?: string | null
          content?: string
          entry_date?: string
          mood?: number | null
          images?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}
