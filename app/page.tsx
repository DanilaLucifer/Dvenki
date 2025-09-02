import { Metadata } from 'next'
import { Hero } from '@/components/landing/Hero'
import { Auth } from '@/components/auth/Auth'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Dvenki - Платформа для создания журналов по расписанию',
  description: 'Создавайте структурированные дневники, используйте умные шаблоны и делитесь вдохновением с друзьями',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-10 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg">D</span>
              </motion.div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dvenki</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <span>Ваш личный дневник</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <Hero />
          </div>
        </motion.section>

        {/* Auth Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-8 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto">
            <div className="max-w-md mx-auto">
              <Auth />
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 lg:py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-sm">D</span>
              </motion.div>
              <span className="text-lg font-bold">Dvenki</span>
            </div>
            <p className="text-gray-400 text-sm lg:text-base mb-4">
              Платформа для создания пользовательского контента по расписанию
            </p>
            <div className="text-gray-500 text-xs">
              © 2024 Dvenki. Все права защищены.
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
