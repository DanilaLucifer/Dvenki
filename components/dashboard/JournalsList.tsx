'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, BookOpen, Search, Filter, Grid, List } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { CreateJournalModal } from './CreateJournalModal'
import { JournalEditor } from './JournalEditor'
import toast from 'react-hot-toast'

interface Journal {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  visibility: string
  created_at: string
  template_id: string | null
}

export function JournalsList() {
  const { user } = useSupabase()
  const [journals, setJournals] = useState<Journal[]>([])
  const [filteredJournals, setFilteredJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchJournals()
    }
  }, [user])

  useEffect(() => {
    filterJournals()
  }, [journals, searchTerm, visibilityFilter])

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setJournals(data || [])
    } catch (error) {
      console.error('Error fetching journals:', error)
      toast.error('Ошибка при загрузке журналов')
    } finally {
      setLoading(false)
    }
  }

  const filterJournals = () => {
    let filtered = journals

    // Поиск по названию и описанию
    if (searchTerm) {
      filtered = filtered.filter(journal =>
        journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (journal.description && journal.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Фильтр по видимости
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(journal => journal.visibility === visibilityFilter)
    }

    setFilteredJournals(filtered)
  }

  const deleteJournal = async (journalId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот журнал?')) return

    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', journalId)

      if (error) throw error
      
      toast.success('Журнал удален')
      fetchJournals()
    } catch (error) {
      console.error('Error deleting journal:', error)
      toast.error('Ошибка при удалении журнала')
    }
  }

  const openEditor = (journal: Journal) => {
    setEditingJournal(journal)
    setShowEditor(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка журналов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Мои журналы</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">
            Создавайте и ведите персональные журналы
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Создать журнал</span>
          <span className="sm:hidden">Создать</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">Все журналы</option>
            <option value="public">Публичные</option>
            <option value="private">Приватные</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Найдено {filteredJournals.length} из {journals.length} журналов
      </div>

      {/* Journals Grid/List */}
      {filteredJournals.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {journals.length === 0 ? 'У вас пока нет журналов' : 'Журналы не найдены'}
          </h3>
          <p className="text-gray-600 mb-6 text-sm lg:text-base">
            {journals.length === 0 
              ? 'Создайте свой первый журнал и начните вести записи'
              : 'Попробуйте изменить параметры поиска или фильтры'
            }
          </p>
          {journals.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Создать первый журнал
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'
            : 'space-y-4'
        }>
          {filteredJournals.map((journal) => (
            <div 
              key={journal.id} 
              className={`card-hover group ${
                viewMode === 'list' ? 'flex gap-4' : ''
              }`}
            >
              {/* Cover Image */}
              {journal.cover_image && (
                <div className={`${
                  viewMode === 'list' 
                    ? 'w-24 h-24 flex-shrink-0' 
                    : 'w-full h-48'
                } bg-gray-200 rounded-lg overflow-hidden`}>
                  <img
                    src={journal.cover_image}
                    alt={journal.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className={`flex-1 ${viewMode === 'list' ? 'min-w-0' : ''}`}>
                {/* Visibility Badge */}
                <div className="flex items-center gap-2 mb-3">
                  {journal.visibility === 'public' ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-xs text-gray-500 capitalize">
                    {journal.visibility === 'public' ? 'Публичный' : 'Приватный'}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`font-semibold text-gray-900 mb-2 ${
                  viewMode === 'list' ? 'text-lg' : 'text-xl'
                } line-clamp-2`}>
                  {journal.title}
                </h3>
                
                {/* Description */}
                {journal.description && (
                  <p className={`text-gray-600 mb-4 ${
                    viewMode === 'list' ? 'line-clamp-3' : 'line-clamp-2'
                  }`}>
                    {journal.description}
                  </p>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(journal.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                {/* Actions */}
                <div className={`flex gap-2 ${
                  viewMode === 'list' ? 'flex-col sm:flex-row' : ''
                }`}>
                  <button
                    onClick={() => openEditor(journal)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Открыть</span>
                    <span className="sm:hidden">Открыть</span>
                  </button>
                  <button
                    onClick={() => deleteJournal(journal.id)}
                    className="btn-outline text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 text-sm px-3 py-2"
                    title="Удалить журнал"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateJournalModal
          onClose={() => setShowCreateModal(false)}
          onJournalCreated={fetchJournals}
        />
      )}

      {showEditor && editingJournal && (
        <JournalEditor
          journal={editingJournal}
          onClose={() => {
            setShowEditor(false)
            setEditingJournal(null)
          }}
        />
      )}
    </div>
  )
}
