'use client'

import { useState, useEffect } from 'react'
import { User, Camera, Save, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export function Profile() {
  const { user } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: null as File | null
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      
      setProfile(data)
      setFormData({
        display_name: data.display_name || '',
        bio: data.bio || '',
        avatar_url: null
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Ошибка при загрузке профиля')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  const handleSave = async () => {
    if (!formData.display_name.trim()) {
      toast.error('Введите отображаемое имя')
      return
    }

    setSaving(true)
    try {
      let avatarUrl = profile?.avatar_url

      if (formData.avatar_url) {
        avatarUrl = await handleAvatarUpload(formData.avatar_url)
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name.trim(),
          bio: formData.bio.trim() || null,
          avatar_url: avatarUrl
        })
        .eq('user_id', user?.id)

      if (error) throw error

      toast.success('Профиль обновлен')
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Ошибка при обновлении профиля')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, avatar_url: file }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
        <p className="text-gray-600 mt-2">
          Управляйте информацией о себе и настройками профиля
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Информация профиля</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Редактировать
              </button>
            )}
          </div>

          {editing ? (
            <form className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.avatar_url ? (
                      <img
                        src={URL.createObjectURL(formData.avatar_url)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Загрузите новое фото профиля
                  </p>
                  <p className="text-xs text-gray-500">
                    Рекомендуемый размер: 200x200 пикселей
                  </p>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Отображаемое имя *
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="input-field"
                  placeholder="Ваше имя"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  О себе
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="input-field"
                  rows={4}
                  placeholder="Расскажите немного о себе..."
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input-field bg-gray-50 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email нельзя изменить
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      display_name: profile?.display_name || '',
                      bio: profile?.bio || '',
                      avatar_url: null
                    })
                  }}
                  className="btn-secondary"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Сохранить
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Avatar Display */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {profile?.display_name || 'Без имени'}
                  </h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              {/* Bio Display */}
              {profile?.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">О себе</h4>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              )}

              {/* Profile Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Дата регистрации</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Последнее обновление</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('ru-RU') : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
