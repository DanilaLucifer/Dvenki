'use client'

import { BookOpen, FileText, User, Users, Bell, LogOut, Home, Globe, Heart } from 'lucide-react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { motion } from 'framer-motion'

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
    <div className="w-full lg:w-72 bg-gradient-to-b from-white to-gray-50 shadow-lg min-h-screen border-r border-gray-200">
      <div className="p-4 lg:p-6">
        {/* Logo and Brand */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="w-10 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <BookOpen className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dvenki</h1>
            <p className="text-xs text-gray-500">Ваш личный дневник</p>
          </div>
        </motion.div>

        {/* Navigation Menu */}
        <motion.nav 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-1 mb-8"
        >
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <motion.button
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * menuItems.indexOf(item) }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-md border-l-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'
                } relative z-10`} />
                <div className="flex-1 min-w-0 relative z-10">
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
              </motion.button>
            )
          })}
        </motion.nav>

        {/* User Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-auto pt-6 border-t border-gray-200"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-4 py-3 mb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-sm font-bold text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">Пользователь</p>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:shadow-md transition-all duration-200 group border border-transparent hover:border-red-200"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            <span className="font-medium text-sm lg:text-base">Выйти</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
