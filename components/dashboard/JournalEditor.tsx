'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Save, Calendar, Image as ImageIcon, Smile, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Journal {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  visibility: string
  template_id: string | null
}

interface Entry {
  id: string
  title: string | null
  content: string
  entry_date: string
  mood: number | null
  images: string[] | null
  is_published: boolean
  created_at: string
}

interface JournalEditorProps {
  journal: Journal
  onClose: () => void
}

export function JournalEditor({ journal, onClose }: JournalEditorProps) {
  const { user } = useSupabase()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentEntry, setCurrentEntry] = useState<Partial<Entry>>({
    title: '',
    content: '',
    mood: null,
    images: [],
    is_published: false
  })
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [showEntryForm, setShowEntryForm] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [journal.id])

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('journal_id', journal.id)
        .order('entry_date', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error('Ошибка при загрузке записей')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `entry-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('entry-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('entry-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      const uploadedUrls = await Promise.all(
        files.map(file => handleImageUpload(file))
      )
      
      setCurrentEntry(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }))
    } catch (error) {
      toast.error('Ошибка при загрузке изображений')
    }
  }

  const saveEntry = async () => {
    if (!currentEntry.content.trim()) {
      toast.error('Введите содержание записи')
      return
    }

    try {
      const entryData = {
        journal_id: journal.id,
        user_id: user?.id,
        title: currentEntry.title?.trim() || null,
        content: currentEntry.content.trim(),
        entry_date: format(selectedDate, 'yyyy-MM-dd'),
        mood: currentEntry.mood,
        images: currentEntry.images || [],
        is_published: currentEntry.is_published
      }

      if (editingEntry) {
        const { error } = await supabase
          .from('entries')
          .update(entryData)
          .eq('id', editingEntry.id)

        if (error) throw error
        toast.success('Запись обновлена')
      } else {
        const { error } = await supabase
          .from('entries')
          .insert(entryData)

        if (error) throw error
        toast.success('Запись создана')
      }

      setCurrentEntry({
        title: '',
        content: '',
        mood: null,
        images: [],
        is_published: false
      })
      setEditingEntry(null)
      setShowEntryForm(false)
      fetchEntries()
    } catch (error) {
      console.error('Error saving entry:', error)
      toast.error('Ошибка при сохранении записи')
    }
  }

  const editEntry = (entry: Entry) => {
    setEditingEntry(entry)
    setCurrentEntry({
      title: entry.title || '',
      content: entry.content,
      mood: entry.mood,
      images: entry.images || [],
      is_published: entry.is_published
    })
    setSelectedDate(new Date(entry.entry_date))
    setShowEntryForm(true)
  }

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return

    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      
      toast.success('Запись удалена')
      fetchEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast.error('Ошибка при удалении записи')
    }
  }

  const getEntryForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return entries.find(entry => entry.entry_date === dateStr)
  }

  const renderCalendar = () => {
    const today = new Date()
    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()
    
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const calendarDays = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      calendarDays.push(date)
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {calendarDays.map((date, index) => {
          const entry = getEntryForDate(date)
          const isCurrentMonth = date.getMonth() === currentMonth
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
          
          return (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`p-2 text-sm rounded-lg transition-colors ${
                isCurrentMonth
                  ? 'hover:bg-gray-100'
                  : 'text-gray-300'
              } ${
                isToday ? 'bg-primary-100 text-primary-700' : ''
              } ${
                entry ? 'bg-green-100 text-green-700' : ''
              }`}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{journal.title}</h2>
            {journal.description && (
              <p className="text-gray-600 mt-1">{journal.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - Calendar */}
          <div className="w-80 border-r border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Календарь</h3>
              {renderCalendar()}
            </div>

            <button
              onClick={() => {
                setShowEntryForm(true)
                setEditingEntry(null)
                setCurrentEntry({
                  title: '',
                  content: '',
                  mood: null,
                  images: [],
                  is_published: false
                })
              }}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Новая запись
            </button>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {showEntryForm ? (
              /* Entry Form */
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="max-w-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {editingEntry ? 'Редактировать запись' : 'Новая запись'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Дата
                      </label>
                      <input
                        type="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Заголовок (необязательно)
                      </label>
                      <input
                        type="text"
                        value={currentEntry.title || ''}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                        className="input-field"
                        placeholder="Заголовок записи"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Содержание *
                      </label>
                      <textarea
                        value={currentEntry.content}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                        className="input-field"
                        rows={8}
                        placeholder="Опишите ваш день, мысли, чувства..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Настроение (1-5)
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((mood) => (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => setCurrentEntry(prev => ({ ...prev, mood }))}
                            className={`p-2 rounded-lg transition-colors ${
                              currentEntry.mood === mood
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Smile className="w-6 h-6" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Изображения
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="input-field"
                      />
                      {currentEntry.images && currentEntry.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {currentEntry.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is-published"
                        checked={currentEntry.is_published || false}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, is_published: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="is-published" className="text-sm text-gray-700">
                        Опубликовать запись
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEntryForm(false)
                          setEditingEntry(null)
                        }}
                        className="btn-secondary"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={saveEntry}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {editingEntry ? 'Обновить' : 'Сохранить'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Entries List */
              <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Записи за {format(selectedDate, 'MMMM yyyy', { locale: ru })}
                </h3>

                {entries.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Записей пока нет
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Создайте свою первую запись в журнале
                    </p>
                    <button
                      onClick={() => setShowEntryForm(true)}
                      className="btn-primary"
                    >
                      Создать запись
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries
                      .filter(entry => {
                        const entryMonth = new Date(entry.entry_date).getMonth()
                        const entryYear = new Date(entry.entry_date).getFullYear()
                        return entryMonth === selectedDate.getMonth() && entryYear === selectedDate.getFullYear()
                      })
                      .map((entry) => (
                        <div key={entry.id} className="card">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {format(new Date(entry.entry_date), 'dd MMMM yyyy', { locale: ru })}
                              </span>
                              {entry.mood && (
                                <div className="flex items-center gap-1">
                                  <Smile className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm text-gray-600">{entry.mood}/5</span>
                                </div>
                              )}
                              {entry.is_published ? (
                                <Eye className="w-4 h-4 text-green-500" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editEntry(entry)}
                                className="text-primary-600 hover:text-primary-700 text-sm"
                              >
                                Редактировать
                              </button>
                              <button
                                onClick={() => deleteEntry(entry.id)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>

                          {entry.title && (
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {entry.title}
                            </h4>
                          )}

                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                            {entry.content}
                          </p>

                          {entry.images && entry.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {entry.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
