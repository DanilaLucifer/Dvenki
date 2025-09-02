'use client'

import { useState, useEffect } from 'react'
import { Bell, Settings, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import toast from 'react-hot-toast'

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  daily_reminders: boolean
  weekly_summary: boolean
  reminder_time: string
}

export function Notifications() {
  const { user } = useSupabase()
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    daily_reminders: true,
    weekly_summary: false,
    reminder_time: '09:00'
  })
  const [saving, setSaving] = useState(false)
  const [upcomingReminders, setUpcomingReminders] = useState<Array<{
    id: string
    journal_title: string
    date: string
    type: string
  }>>([])

  useEffect(() => {
    if (user) {
      fetchUpcomingReminders()
    }
  }, [user])

  const fetchUpcomingReminders = async () => {
    try {
      // Здесь можно добавить логику для получения предстоящих напоминаний
      // Пока используем моковые данные
      const mockReminders = [
        {
          id: '1',
          journal_title: 'Дневник благодарности',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          type: 'daily'
        },
        {
          id: '2',
          journal_title: 'Журнал тренировок',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'weekly'
        }
      ]
      setUpcomingReminders(mockReminders)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Здесь можно добавить логику сохранения настроек в базу данных
      await new Promise(resolve => setTimeout(resolve, 1000)) // Имитация API вызова
      
      toast.success('Настройки уведомлений сохранены')
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast.error('Ошибка при сохранении настроек')
    } finally {
      setSaving(false)
    }
  }

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Dvenki', {
        body: 'Это тестовое уведомление от платформы Dvenki',
        icon: '/favicon.ico'
      })
      toast.success('Тестовое уведомление отправлено')
    } else {
      toast.error('Разрешите уведомления в браузере')
    }
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          toast.success('Разрешение на уведомления получено')
        } else {
          toast.error('Разрешение на уведомления отклонено')
        }
      })
    }
  }

  const formatReminderDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Завтра'
    if (diffDays === 0) return 'Сегодня'
    return `Через ${diffDays} дней`
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Уведомления</h1>
        <p className="text-gray-600 mt-2">
          Настройте уведомления и напоминания для ваших журналов
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Настройки уведомлений</h2>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Email уведомления</h3>
                <p className="text-sm text-gray-600">Получать уведомления на email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Push уведомления</h3>
                <p className="text-sm text-gray-600">Получать уведомления в браузере</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.push_notifications}
                  onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Daily Reminders */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Ежедневные напоминания</h3>
                <p className="text-sm text-gray-600">Напоминания о записях в журналах</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.daily_reminders}
                  onChange={(e) => handleSettingChange('daily_reminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Weekly Summary */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Еженедельный отчет</h3>
                <p className="text-sm text-gray-600">Получать сводку за неделю</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weekly_summary}
                  onChange={(e) => handleSettingChange('weekly_summary', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Reminder Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время напоминаний
              </label>
              <input
                type="time"
                value={settings.reminder_time}
                onChange={(e) => handleSettingChange('reminder_time', e.target.value)}
                className="input-field w-32"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={saveSettings}
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
                    <CheckCircle className="w-4 h-4" />
                    Сохранить настройки
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notification Testing & Permissions */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-secondary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Тестирование уведомлений</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Разрешения браузера</h3>
              <p className="text-sm text-blue-700 mb-3">
                Для получения push-уведомлений необходимо разрешить их в браузере
              </p>
              <button
                onClick={requestNotificationPermission}
                className="btn-secondary text-sm"
              >
                Запросить разрешение
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Тестовое уведомление</h3>
              <p className="text-sm text-green-700 mb-3">
                Отправьте тестовое уведомление, чтобы проверить настройки
              </p>
              <button
                onClick={testNotification}
                className="btn-primary text-sm"
              >
                Отправить тест
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="card mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-warm-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-warm-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Предстоящие напоминания</h2>
        </div>

        {upcomingReminders.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Напоминаний пока нет
            </h3>
            <p className="text-gray-600">
              Создайте журнал и установите расписание для получения напоминаний
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warm-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-warm-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{reminder.journal_title}</h4>
                    <p className="text-sm text-gray-500">
                      {reminder.type === 'daily' ? 'Ежедневное' : 'Еженедельное'} напоминание
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatReminderDate(reminder.date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(reminder.date).toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
