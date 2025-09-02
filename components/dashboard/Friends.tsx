'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, UserX, Search, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: string
  created_at: string
  requester_profile?: {
    display_name: string | null
    avatar_url: string | null
  }
  addressee_profile?: {
    display_name: string | null
    avatar_url: string | null
  }
}

interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
}

export function Friends() {
  const { user } = useSupabase()
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (user) {
      fetchFriendships()
    }
  }, [user])

  const fetchFriendships = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester_profile:profiles!friendships_requester_id_fkey(display_name, avatar_url),
          addressee_profile:profiles!friendships_addressee_id_fkey(display_name, avatar_url)
        `)
        .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFriendships(data || [])
    } catch (error) {
      console.error('Error fetching friendships:', error)
      toast.error('Ошибка при загрузке друзей')
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .or(`display_name.ilike.%${searchQuery}%`)
        .neq('user_id', user?.id)
        .limit(10)

      if (error) throw error

      // Фильтруем пользователей, которые уже в друзьях или имеют запросы
      const filteredResults = data?.filter(profile => {
        const hasFriendship = friendships.some(friendship => 
          (friendship.requester_id === profile.id && friendship.addressee_id === user?.id) ||
          (friendship.addressee_id === profile.id && friendship.requester_id === user?.id)
        )
        return !hasFriendship
      }) || []

      setSearchResults(filteredResults)
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Ошибка при поиске пользователей')
    } finally {
      setSearching(false)
    }
  }

  const sendFriendRequest = async (targetUserId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user?.id,
          addressee_id: targetUserId,
          status: 'pending'
        })

      if (error) throw error

      toast.success('Запрос в друзья отправлен')
      setSearchResults([])
      setSearchQuery('')
      fetchFriendships()
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast.error('Ошибка при отправке запроса')
    }
  }

  const respondToFriendRequest = async (friendshipId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status })
        .eq('id', friendshipId)

      if (error) throw error

      toast.success(status === 'accepted' ? 'Запрос принят' : 'Запрос отклонен')
      fetchFriendships()
    } catch (error) {
      console.error('Error responding to friend request:', error)
      toast.error('Ошибка при обработке запроса')
    }
  }

  const removeFriend = async (friendshipId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого друга?')) return

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error

      toast.success('Друг удален')
      fetchFriendships()
    } catch (error) {
      console.error('Error removing friend:', error)
      toast.error('Ошибка при удалении друга')
    }
  }

  const getFriendProfile = (friendship: Friendship) => {
    if (friendship.requester_id === user?.id) {
      return friendship.addressee_profile
    } else {
      return friendship.requester_profile
    }
  }

  const getPendingRequests = () => {
    return friendships.filter(friendship => 
      friendship.status === 'pending' && friendship.addressee_id === user?.id
    )
  }

  const getAcceptedFriends = () => {
    return friendships.filter(friendship => 
      friendship.status === 'accepted'
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Друзья</h1>
        <p className="text-gray-600 mt-2">
          Управляйте своими друзьями и находите новых
        </p>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card mb-8 shadow-lg border-2 border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Найти друзей</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени..."
              className="input-field transition-all duration-200 focus:scale-[1.02]"
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={searchUsers}
            disabled={searching || !searchQuery.trim()}
            className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {searching ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-4 w-4 border-b-2 border-white"
              />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Найти
          </motion.button>
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-3 overflow-hidden"
            >
            <h3 className="text-sm font-medium text-gray-700">Результаты поиска:</h3>
            {searchResults.map((profile) => (
              <motion.div 
                key={profile.id} 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center overflow-hidden shadow-sm"
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-gray-400" />
                    )}
                  </motion.div>
                  <span className="font-medium text-gray-900">
                    {profile.display_name || 'Без имени'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendFriendRequest(profile.id)}
                  className="btn-primary flex items-center gap-2 text-sm shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  Добавить в друзья
                </motion.button>
              </motion.div>
            ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pending Requests */}
      {getPendingRequests().length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Входящие запросы</h2>
          <div className="space-y-3">
            {getPendingRequests().map((friendship) => {
              const profile = friendship.requester_profile
              return (
                <div key={friendship.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {profile?.display_name || 'Без имени'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToFriendRequest(friendship.id, 'accepted')}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      Принять
                    </button>
                    <button
                      onClick={() => respondToFriendRequest(friendship.id, 'declined')}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <UserX className="w-4 h-4" />
                      Отклонить
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Мои друзья</h2>
        {getAcceptedFriends().length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              У вас пока нет друзей
            </h3>
            <p className="text-gray-600">
              Найдите друзей, чтобы делиться своими журналами
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {getAcceptedFriends().map((friendship) => {
              const profile = getFriendProfile(friendship)
              return (
                <div key={friendship.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        {profile?.display_name || 'Без имени'}
                      </span>
                      <p className="text-sm text-gray-500">
                        Друзья с {new Date(friendship.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFriend(friendship.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Удалить
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
