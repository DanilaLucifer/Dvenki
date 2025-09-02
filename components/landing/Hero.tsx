'use client'

import { motion } from 'framer-motion'
import { BookOpen, Calendar, Users, Heart, Sparkles, Clock, Share2 } from 'lucide-react'

export function Hero() {
  return (
    <div className="text-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 lg:mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Новая платформа для ведения дневников</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
          Создавайте
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-transparent bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text block sm:inline"
          > журналы</motion.span>
          <br className="hidden sm:block" />
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-gray-700"
          >по расписанию</motion.span>
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed">
          Структурируйте свои мысли, ведите дневники и делитесь вдохновением 
          с помощью умных шаблонов и удобного планирования
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-12 lg:mb-16"
      >
        <motion.div 
          className="text-center group"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        >
          <motion.div 
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-primary-100 to-primary-200 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 border border-primary-200"
          >
            <BookOpen className="w-10 h-10 lg:w-12 lg:h-12 text-primary-600" />
          </motion.div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">Умные шаблоны</h3>
          <p className="text-gray-600 text-sm lg:text-base leading-relaxed px-2">
            Выбирайте из готовых шаблонов или создавайте свои уникальные
          </p>
        </motion.div>

        <motion.div 
          className="text-center group"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, delay: 0.1 }}
        >
          <motion.div 
            whileHover={{ rotate: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-warm-100 to-warm-200 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 border border-warm-200"
          >
            <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-warm-600" />
          </motion.div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">Планирование</h3>
          <p className="text-gray-600 text-sm lg:text-base leading-relaxed px-2">
            Устанавливайте расписание и получайте умные напоминания
          </p>
        </motion.div>

        <motion.div 
          className="text-center group sm:col-span-2 lg:col-span-1"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, delay: 0.2 }}
        >
          <motion.div 
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-secondary-100 to-secondary-200 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 border border-secondary-200"
          >
            <Share2 className="w-10 h-10 lg:w-12 lg:h-12 text-secondary-600" />
          </motion.div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 lg:mb-3">Социальность</h3>
          <p className="text-gray-600 text-sm lg:text-base leading-relaxed px-2">
            Делитесь с друзьями и находите единомышленников
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <div className="flex items-center gap-2 text-sm lg:text-base text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
          <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
          <span>Более 1000 пользователей уже создают свои журналы</span>
        </div>
      </motion.div>
    </div>
  )
}
