'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, BookOpen, User, Calendar, ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { PublicFeedItem, Comment } from '@/types'
import toast from 'react-hot-toast'

export function PublicFeed() {
  const { user } = useSupabase()
  const [feedItems, setFeedItems] = useState<PublicFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
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
          profile:profiles(*)
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
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск по записям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full"
          />
          <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          <option value="all">Все типы</option>
          <option value="gratitude">Благодарность</option>
          <option value="workout">Тренировки</option>
          <option value="daily">Ежедневный</option>
          <option value="travel">Путешествия</option>
          <option value="photo">Фото</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Найдено {filteredItems.length} записей
      </div>

      {/* Feed Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Публичные записи не найдены
          </h3>
          <p className="text-gray-600 text-sm lg:text-base">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item) => (
            <div key={item.entry.id} className="card-hover">
              {/* Entry Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.profile.display_name || 'Пользователь'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(item.entry.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {item.entry.images.slice(0, 6).map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Изображение ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Entry Mood */}
              {item.entry.mood && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">Настроение:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= item.entry.mood! ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {/* Like/Dislike */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(item.entry.id, true)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                        item.user_like === true
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.likes_count}</span>
                    </button>
                    
                    <button
                      onClick={() => handleLike(item.entry.id, false)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                        item.user_like === false
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.dislikes_count}</span>
                    </button>
                  </div>

                  {/* Comments */}
                  <button
                    onClick={() => toggleComments(item.entry.id)}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.comments_count}</span>
                  </button>
                </div>

                {/* Share */}
                <button className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Поделиться</span>
                </button>
              </div>

              {/* Comments Section */}
              {selectedEntry === item.entry.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-3">Комментарии</h5>
                  
                  {/* Comments List */}
                  <div className="space-y-3 mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user_id === user?.id ? 'Вы' : 'Пользователь'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Добавить комментарий..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="input-field flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(item.entry.id)}
                    />
                    <button
                      onClick={() => handleComment(item.entry.id)}
                      disabled={submittingComment || !newComment.trim()}
                      className="btn-primary px-4 py-2 disabled:opacity-50"
                    >
                      {submittingComment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
