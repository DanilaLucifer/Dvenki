'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Sidebar } from './Sidebar'
import { JournalsList } from './JournalsList'
import { TemplatesList } from './TemplatesList'
import { Profile } from './Profile'
import { Friends } from './Friends'
import { Notifications } from './Notifications'
import { PublicFeed } from './PublicFeed'
import { Menu, X } from 'lucide-react'

type DashboardView = 'journals' | 'templates' | 'profile' | 'friends' | 'notifications' | 'public-feed'

export function Dashboard() {
  const { user, signOut } = useSupabase()
  const [currentView, setCurrentView] = useState<DashboardView>('journals')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return null
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'journals':
        return <JournalsList />
      case 'templates':
        return <TemplatesList />
      case 'profile':
        return <Profile />
      case 'friends':
        return <Friends />
      case 'notifications':
        return <Notifications />
      case 'public-feed':
        return <PublicFeed />
      default:
        return <JournalsList />
    }
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Dvenki</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView}
            onSignOut={signOut}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={closeSidebar}
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform">
              <Sidebar 
                currentView={currentView} 
                onViewChange={(view) => {
                  setCurrentView(view as DashboardView)
                  closeSidebar()
                }}
                onSignOut={signOut}
              />
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {currentView === 'journals' && 'Мои журналы'}
                {currentView === 'templates' && 'Шаблоны журналов'}
                {currentView === 'profile' && 'Мой профиль'}
                {currentView === 'friends' && 'Друзья'}
                {currentView === 'notifications' && 'Уведомления'}
                {currentView === 'public-feed' && 'Публичная лента'}
              </h2>
              <p className="text-gray-600 text-sm lg:text-base">
                {currentView === 'journals' && 'Создавайте и управляйте своими личными журналами'}
                {currentView === 'templates' && 'Выбирайте из готовых шаблонов для быстрого старта'}
                {currentView === 'profile' && 'Настройте свой профиль и предпочтения'}
                {currentView === 'friends' && 'Найдите друзей и делитесь своими журналами'}
                {currentView === 'notifications' && 'Настройте уведомления и напоминания'}
                {currentView === 'public-feed' && 'Открывайте для себя интересные записи других пользователей'}
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              {renderCurrentView()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
