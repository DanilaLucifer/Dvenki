'use client'

import { useState, useEffect } from 'react'
import { X, Upload, BookOpen, Image, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Template {
  id: string
  name: string
  description: string | null
  type: string
  prompt_text: string | null
}

interface CreateJournalModalProps {
  onClose: () => void
  onJournalCreated: () => void
}

export function CreateJournalModal({ onClose, onJournalCreated }: CreateJournalModalProps) {
  const { user } = useSupabase()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    template_id: '',
    visibility: 'private',
    cover_image: null as File | null
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `journal-covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('journal-covers')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('journal-covers')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Введите название журнала')
      return
    }

    setLoading(true)
    try {
      let coverImageUrl = null

      if (formData.cover_image) {
        coverImageUrl = await handleImageUpload(formData.cover_image)
      }

      const { error } = await supabase
        .from('journals')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          template_id: formData.template_id || null,
          cover_image: coverImageUrl,
          visibility: formData.visibility,
          user_id: user?.id
        })

      if (error) throw error

      toast.success('Журнал создан успешно!')
      onJournalCreated()
      onClose()
    } catch (error) {
      console.error('Error creating journal:', error)
      toast.error('Ошибка при создании журнала')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, cover_image: file }))
      
      // Создаем превью для изображения
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, cover_image: null }))
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return '🌍'
      case 'friends':
        return '👥'
      case 'private':
        return '🔒'
      default:
        return '🔒'
    }
  }

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Виден всем пользователям'
      case 'friends':
        return 'Виден только вашим друзьям'
      case 'private':
        return 'Виден только вам'
      default:
        return 'Виден только вам'
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center justify-between p-6 border-b border-gray-200"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <BookOpen className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Создать журнал</h2>
              <p className="text-sm text-gray-500">Новый личный дневник</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Form */}
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="p-6 space-y-6"
        >
          {/* Title */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <label className="form-label required">
              Название журнала
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input-field transition-all duration-200 focus:scale-[1.02]"
              placeholder="Мой дневник благодарности"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 символов
            </p>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <label className="form-label">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field transition-all duration-200 focus:scale-[1.02]"
              rows={3}
              placeholder="Краткое описание вашего журнала (необязательно)"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 символов
            </p>
          </motion.div>

          {/* Template Selection */}
          <div>
            <label className="form-label">
              Шаблон
            </label>
            <select
              value={formData.template_id}
              onChange={(e) => setFormData(prev => ({ ...prev, template_id: e.target.value }))}
              className="input-field"
            >
              <option value="">Без шаблона - начните с чистого листа</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description || 'Без описания'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Шаблон поможет структурировать ваши записи
            </p>
          </div>

          {/* Visibility */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <label className="form-label">
              Видимость
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['private', 'friends', 'public'].map((visibility) => (
                <motion.label
                  key={visibility}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative cursor-pointer border-2 rounded-xl p-3 transition-all ${
                    formData.visibility === visibility
                      ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  } shadow-sm`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={visibility}
                    checked={formData.visibility === visibility}
                    onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <motion.div 
                      animate={{ scale: formData.visibility === visibility ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-2xl mb-2"
                    >
                      {getVisibilityIcon(visibility)}
                    </motion.div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {visibility === 'public' ? 'Публичный' : visibility === 'friends' ? 'Для друзей' : 'Приватный'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getVisibilityDescription(visibility)}
                    </div>
                  </div>
                </motion.label>
              ))}
            </div>
          </motion.div>

          {/* Cover Image */}
          <div>
            <label className="form-label">
              Обложка журнала
            </label>
            
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-300 transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cover-image"
                />
                <label htmlFor="cover-image" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-50 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Нажмите для загрузки изображения
                  </p>
                  <p className="text-xs text-gray-500">
                    Рекомендуемый размер: 800x600px
                  </p>
                </label>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Обложка поможет вашему журналу выделиться
            </p>
          </div>

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary shadow-sm hover:shadow-md transition-all duration-200"
              disabled={loading}
            >
              Отмена
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-4 w-4 border-b-2 border-white"
                  />
                  <span className="hidden sm:inline">Создание...</span>
                  <span className="sm:hidden">Создание</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Создать журнал</span>
                  <span className="sm:hidden">Создать</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  )
}
