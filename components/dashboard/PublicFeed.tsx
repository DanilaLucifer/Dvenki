'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, BookOpen, User, Calendar, ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { PublicFeedItem, Comment, CommentWithProfile } from '@/types'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export function PublicFeed() {
  const { user } = useSupabase()
  const [feedItems, setFeedItems] = useState<PublicFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      fetchPublicFeed()
    }
  }, [user, filter])

  const fetchPublicFeed = async () => {
    try {
      setLoading(true)
      
      // Получаем публичные записи с информацией о журналах и профилях
      const { data: entries, error: entriesError } = await supabase
        .from('entries')
        .select(`
          *,
          journal:journals(*),
          profile:profiles!journals(user_id)(*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (entriesError) throw entriesError

      // Получаем лайки для каждой записи
      const entriesWithLikes = await Promise.all(
        entries?.map(async (entry) => {
          const { data: likesData } = await supabase
            .from('likes')
            .select('*')
            .eq('entry_id', entry.id)

          const { data: commentsData } = await supabase
            .from('comments')
            .select('*')
            .eq('entry_id', entry.id)

          const userLike = likesData?.find(like => like.user_id === user?.id)

          return {
            entry: {
              ...entry,
              journal: entry.journal,
              profile: entry.profile
            },
            journal: entry.journal,
            profile: entry.profile,
            likes_count: likesData?.filter(like => like.is_like).length || 0,
            dislikes_count: likesData?.filter(like => !like.is_like).length || 0,
            comments_count: commentsData?.length || 0,
            user_like: userLike ? userLike.is_like : null,
            is_bookmarked: false // TODO: добавить закладки
          }
        }) || []
      )

      setFeedItems(entriesWithLikes)
    } catch (error) {
      console.error('Error fetching public feed:', error)
      toast.error('Ошибка при загрузке ленты')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (entryId: string, isLike: boolean) => {
    if (!user) return

    try {
      // Проверяем, есть ли уже лайк от пользователя
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('entry_id', entryId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        if (existingLike.is_like === isLike) {
          // Удаляем лайк, если пользователь нажал на тот же тип
          await supabase
            .from('likes')
            .delete()
            .eq('id', existingLike.id)
        } else {
          // Обновляем тип лайка
          await supabase
            .from('likes')
            .update({ is_like: isLike })
            .eq('id', existingLike.id)
        }
      } else {
        // Создаем новый лайк
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            entry_id: entryId,
            is_like: isLike
          })
      }

      // Обновляем локальное состояние
      fetchPublicFeed()
      toast.success(isLike ? 'Лайк добавлен!' : 'Дизлайк добавлен!')
    } catch (error) {
      console.error('Error handling like:', error)
      toast.error('Ошибка при обработке лайка')
    }
  }

  const fetchComments = async (entryId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles!comments_user_id_fkey(*)
        `)
        .eq('entry_id', entryId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Ошибка при загрузке комментариев')
    }
  }

  const handleComment = async (entryId: string) => {
    if (!user || !newComment.trim()) return

    try {
      setSubmittingComment(true)
      
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          entry_id: entryId,
          content: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      fetchComments(entryId)
      toast.success('Комментарий добавлен!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Ошибка при добавлении комментария')
    } finally {
      setSubmittingComment(false)
    }
  }

  const toggleComments = (entryId: string) => {
    if (selectedEntry === entryId) {
      setSelectedEntry(null)
      setComments([])
    } else {
      setSelectedEntry(entryId)
      fetchComments(entryId)
    }
  }

  const filteredItems = feedItems.filter(item => {
    const matchesFilter = filter === 'all' || item.journal.type === filter
    const matchesSearch = !searchQuery || 
      item.entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка публичной ленты...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with Search and Filters */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск по записям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full transition-all duration-200 focus:scale-[1.02]"
          />
          <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-full sm:w-auto transition-all duration-200 focus:scale-[1.02]"
        >
          <option value="all">Все типы</option>
          <option value="gratitude">Благодарность</option>
          <option value="workout">Тренировки</option>
          <option value="daily">Ежедневный</option>
          <option value="travel">Путешествия</option>
          <option value="photo">Фото</option>
        </select>
      </motion.div>

      {/* Results count */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-sm text-gray-600"
      >
        Найдено {filteredItems.length} записей
      </motion.div>

      {/* Feed Items */}
      {filteredItems.length === 0 ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-16"
        >
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Публичные записи не найдены
          </h3>
          <p className="text-gray-600 text-sm lg:text-base">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-6"
        >
          {filteredItems.map((item) => (
            <motion.div 
              key={item.entry.id} 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="card-hover overflow-hidden"
            >
              {/* Entry Header */}
              <div className="flex items-start gap-3 mb-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                >
                  <User className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.profile.display_name || 'Пользователь'}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {new Date(item.entry.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Журнал: {item.journal.title}
                  </p>
                </div>
              </div>

              {/* Entry Content */}
              {item.entry.title && (
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  {item.entry.title}
                </h4>
              )}
              
              <div className="prose prose-sm max-w-none mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {item.entry.content}
                </p>
              </div>

              {/* Entry Images */}
              {item.entry.images && item.entry.images.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4"
                >
                  {item.entry.images.slice(0, 6).map((image, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md"
                    >
                      <img
                        src={image}
                        alt={`Изображение ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Entry Mood */}
              {item.entry.mood && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200"
                >
                  <span className="text-sm text-gray-600">Настроение:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.span
                        key={star}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, delay: star * 0.1 }}
                        whileHover={{ scale: 1.2 }}
                        className={`text-lg ${
                          star <= item.entry.mood! ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Actions Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-center justify-between pt-4 border-t border-gray-200"
              >
                <div className="flex items-center gap-4">
                  {/* Like/Dislike */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLike(item.entry.id, true)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                        item.user_like === true
                          ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-green-300'
                          : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.likes_count}</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLike(item.entry.id, false)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                        item.user_like === false
                          ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border border-red-300'
                          : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.dislikes_count}</span>
                    </motion.button>
                  </div>

                  {/* Comments */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleComments(item.entry.id)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border ${
                      selectedEntry === item.entry.id
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300'
                        : 'text-gray-600 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.comments_count}</span>
                  </motion.button>
                </div>

                {/* Share */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Поделиться</span>
                </motion.button>
              </motion.div>

              {/* Comments Section */}
              <AnimatePresence>
                {selectedEntry === item.entry.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
                  >
                  <h5 className="font-medium text-gray-900 mb-3">Комментарии</h5>
                  
                  {/* Comments List */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-3 mb-4 max-h-64 overflow-y-auto"
                  >
                    {comments.map((comment) => (
                      <motion.div 
                        key={comment.id} 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200"
                      >
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                        >
                          <User className="w-4 h-4 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user_id === user?.id ? 'Вы' : comment.profile?.display_name || 'Пользователь'}
                            </span>
                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                              {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Add Comment */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Добавить комментарий..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="input-field flex-1 transition-all duration-200 focus:scale-[1.02]"
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(item.entry.id)}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleComment(item.entry.id)}
                      disabled={submittingComment || !newComment.trim()}
                      className="btn-primary px-4 py-2 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {submittingComment ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-4 w-4 border-b-2 border-white"
                        />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </motion.button>
                  </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
