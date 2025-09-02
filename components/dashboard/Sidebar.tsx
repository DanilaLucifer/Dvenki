'use client'

import { BookOpen, FileText, User, Users, Bell, LogOut, Home, Globe, Heart } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  onSignOut: () => Promise<void>
}

export function Sidebar({ currentView, onViewChange, onSignOut }: SidebarProps) {
  const { user } = useSupabase()

  const menuItems = [
    { id: 'journals', label: 'Мои журналы', icon: BookOpen, description: 'Управление журналами' },
    { id: 'templates', label: 'Шаблоны', icon: FileText, description: 'Готовые шаблоны' },
    { id: 'public-feed', label: 'Публичная лента', icon: Globe, description: 'Открытые записи' },
    { id: 'friends', label: 'Друзья', icon: Users, description: 'Социальные связи' },
    { id: 'notifications', label: 'Уведомления', icon: Bell, description: 'Настройки уведомлений' },
    { id: 'profile', label: 'Профиль', icon: User, description: 'Личные настройки' },
  ]

  return (
    <div className="w-full lg:w-72 bg-white shadow-lg min-h-screen border-r border-gray-200">
      <div className="p-4 lg:p-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dvenki</h1>
            <p className="text-xs text-gray-500">Ваш личный дневник</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 mb-8">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <span className={`font-medium text-sm lg:text-base block ${
                    isActive ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </span>
                  <span className={`text-xs text-gray-500 mt-0.5 block ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {item.description}
                  </span>
                </div>
              </button>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">Пользователь</p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            <span className="font-medium text-sm lg:text-base">Выйти</span>
          </button>
        </div>
      </div>
    </div>
  )
}
