import { format, formatDistance, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns'
import { ru } from 'date-fns/locale'

export const formatDate = (date: Date | string, formatStr: string = 'dd.MM.yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: ru })
}

export const formatDateRelative = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(dateObj)) {
    return 'Сегодня'
  }
  
  if (isYesterday(dateObj)) {
    return 'Вчера'
  }
  
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE', { locale: ru })
  }
  
  if (isThisYear(dateObj)) {
    return format(dateObj, 'dd MMMM', { locale: ru })
  }
  
  return format(dateObj, 'dd MMMM yyyy', { locale: ru })
}

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: ru })
}

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'HH:mm', { locale: ru })
}

export const formatDateDistance = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistance(dateObj, new Date(), { 
    addSuffix: true, 
    locale: ru 
  })
}

export const getMonthName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMMM yyyy', { locale: ru })
}

export const getWeekdayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'EEEE', { locale: ru })
}

export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const date1Obj = typeof date1 === 'string' ? new Date(date1) : date1
  const date2Obj = typeof date2 === 'string' ? new Date(date2) : date2
  return format(date1Obj, 'yyyy-MM-dd') === format(date2Obj, 'yyyy-MM-dd')
}

export const addDays = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const result = new Date(dateObj)
  result.setDate(result.getDate() + days)
  return result
}

export const getDaysInMonth = (date: Date | string): number => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate()
}

export const getFirstDayOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
}

export const getLastDayOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0)
}
