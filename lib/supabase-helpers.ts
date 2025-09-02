import { supabase } from './supabase'
import { toast } from 'react-hot-toast'

// Хелпер для обработки ошибок Supabase
export const handleSupabaseError = (error: any, defaultMessage: string = 'Произошла ошибка') => {
  console.error('Supabase error:', error)
  
  if (error?.message) {
    toast.error(error.message)
  } else if (error?.error_description) {
    toast.error(error.error_description)
  } else {
    toast.error(defaultMessage)
  }
  
  return { success: false, error }
}

// Хелпер для успешных операций
export const handleSupabaseSuccess = (message: string = 'Операция выполнена успешно') => {
  toast.success(message)
  return { success: true }
}

// Хелпер для загрузки файлов в Supabase Storage
export const uploadFileToStorage = async (
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string
    upsert?: boolean
  }
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return { success: true, data, publicUrl }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при загрузке файла')
  }
}

// Хелпер для удаления файлов из Supabase Storage
export const deleteFileFromStorage = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error

    return { success: true }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при удалении файла')
  }
}

// Хелпер для получения публичного URL файла
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Хелпер для проверки аутентификации
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    return { 
      success: true, 
      isAuthenticated: !!session,
      user: session?.user || null 
    }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при проверке аутентификации')
  }
}

// Хелпер для выхода из системы
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
    
    return handleSupabaseSuccess('Вы успешно вышли из системы')
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при выходе из системы')
  }
}

// Хелпер для получения профиля пользователя
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при загрузке профиля')
  }
}

// Хелпер для обновления профиля пользователя
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при обновлении профиля')
  }
}

// Хелпер для получения журналов пользователя
export const getUserJournals = async (userId: string, options?: {
  limit?: number
  offset?: number
  visibility?: string
}) => {
  try {
    let query = supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.visibility) {
      query = query.eq('visibility', options.visibility)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при загрузке журналов')
  }
}

// Хелпер для получения записей журнала
export const getJournalEntries = async (journalId: string, options?: {
  limit?: number
  offset?: number
  published?: boolean
}) => {
  try {
    let query = supabase
      .from('entries')
      .select('*')
      .eq('journal_id', journalId)
      .order('entry_date', { ascending: false })

    if (options?.published !== undefined) {
      query = query.eq('is_published', options.published)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при загрузке записей')
  }
}

// Хелпер для создания записи в журнале
export const createJournalEntry = async (entryData: any) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .insert(entryData)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при создании записи')
  }
}

// Хелпер для обновления записи в журнале
export const updateJournalEntry = async (entryId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при обновлении записи')
  }
}

// Хелпер для удаления записи из журнала
export const deleteJournalEntry = async (entryId: string) => {
  try {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при удалении записи')
  }
}

// Хелпер для получения друзей пользователя
export const getUserFriends = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        requester_profile:profiles!friendships_requester_id_fkey(display_name, avatar_url),
        addressee_profile:profiles!friendships_addressee_id_fkey(display_name, avatar_url)
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при загрузке друзей')
  }
}

// Хелпер для отправки запроса в друзья
export const sendFriendRequest = async (requesterId: string, addresseeId: string) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при отправке запроса в друзья')
  }
}

// Хелпер для ответа на запрос в друзья
export const respondToFriendRequest = async (friendshipId: string, status: 'accepted' | 'declined') => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return handleSupabaseError(error, 'Ошибка при обработке запроса в друзья')
  }
}
