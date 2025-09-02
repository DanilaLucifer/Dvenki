'use client'

import { useState, useEffect } from 'react'
import { FileText, Heart, Calendar, Camera, BookOpen, MapPin, Search, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Template {
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

const templateIcons: Record<string, any> = {
  gratitude: Heart,
  workout: Calendar,
  photo: Camera,
  daily: BookOpen,
  travel: MapPin,
}

const templateColors: Record<string, string> = {
  gratitude: 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700',
  workout: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700',
  photo: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700',
  daily: 'bg-gradient-to-br from-green-100 to-green-200 text-green-700',
  travel: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700',
}

const templateLabels: Record<string, string> = {
  gratitude: 'Благодарность',
  workout: 'Тренировки',
  photo: 'Фото',
  daily: 'Ежедневный',
  travel: 'Путешествия',
}

export function TemplatesList() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('name')

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Ошибка при загрузке шаблонов')
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesType = selectedType === 'all' || template.type === selectedType
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      templateLabels[template.type]?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesType && matchesSearch
  })

  const uniqueTypes = Array.from(new Set(templates.map(t => t.type)))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка шаблонов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Шаблоны журналов</h1>
        <p className="text-gray-600 text-sm lg:text-base">
          Выбирайте из готовых шаблонов для создания структурированных журналов
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">Все типы</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {templateLabels[type]}
              </option>
            ))}
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
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="space-y-1 w-4 h-4">
                <div className="w-full h-1 bg-current rounded-sm"></div>
                <div className="w-full h-1 bg-current rounded-sm"></div>
                <div className="w-full h-1 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Найдено {filteredTemplates.length} из {templates.length} шаблонов
      </div>

      {/* Type Filter Pills */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedType === 'all'
                ? 'bg-primary-100 text-primary-700 shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            Все типы
          </button>
          {uniqueTypes.map((type) => {
            const Icon = templateIcons[type] || FileText
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedType === type
                    ? 'bg-primary-100 text-primary-700 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                {templateLabels[type]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Шаблоны не найдены
          </h3>
          <p className="text-gray-600 text-sm lg:text-base">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'
            : 'space-y-4'
        }>
          {filteredTemplates.map((template) => {
            const Icon = templateIcons[template.type] || FileText
            const colorClass = templateColors[template.type] || 'bg-gray-100 text-gray-600'
            
            return (
              <div 
                key={template.id} 
                className={`card-hover group ${
                  viewMode === 'list' ? 'flex gap-4' : ''
                }`}
              >
                {/* Icon and Header */}
                <div className={`${
                  viewMode === 'list' ? 'w-16 h-16 flex-shrink-0' : 'w-full'
                } flex items-center gap-3 mb-4`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} shadow-sm group-hover:shadow-md transition-shadow`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {viewMode === 'list' && (
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {template.name}
                      </h3>
                      <span className="text-sm text-gray-500 capitalize">
                        {templateLabels[template.type]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 ${viewMode === 'list' ? 'min-w-0' : ''}`}>
                  {viewMode === 'grid' && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {template.name}
                      </h3>
                      <span className="text-sm text-gray-500 capitalize mb-3 block">
                        {templateLabels[template.type]}
                      </span>
                    </>
                  )}

                  {template.description && (
                    <p className={`text-gray-600 mb-4 ${
                      viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'
                    }`}>
                      {template.description}
                    </p>
                  )}

                  {template.prompt_text && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 border-l-4 border-primary-200">
                      <p className="text-sm text-gray-700 font-medium mb-1">Подсказка для записи:</p>
                      <p className="text-sm text-gray-600 italic line-clamp-2">
                        "{template.prompt_text}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="text-xs">
                      Создан {new Date(template.created_at).toLocaleDateString('ru-RU')}
                    </span>
                    <span className="text-primary-600 font-medium text-xs">
                      Готов к использованию
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
