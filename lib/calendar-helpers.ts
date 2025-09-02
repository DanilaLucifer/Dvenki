import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'

// Интерфейс для дня календаря
export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  hasEntry: boolean
  isSelected: boolean
  dayNumber: number
  weekday: string
}

// Интерфейс для месяца календаря
export interface CalendarMonth {
  year: number
  month: number
  monthName: string
  weeks: CalendarDay[][]
  totalDays: number
}

// Хелпер для получения названий дней недели
export const getWeekdayNames = (): string[] => {
  return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
}

// Хелпер для получения названий месяцев
export const getMonthNames = (): string[] => {
  return [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]
}

// Хелпер для создания календарного месяца
export const createCalendarMonth = (
  date: Date,
  entries: Array<{ entry_date: string }> = []
): CalendarMonth => {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  // Начало и конец месяца
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  
  // Начало и конец недели для полного отображения
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  // Все дни для календаря
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  // Группируем дни по неделям
  const weeks: CalendarDay[][] = []
  let currentWeek: CalendarDay[] = []
  
  allDays.forEach((day) => {
    const isCurrentMonth = isSameMonth(day, date)
    const isTodayDate = isToday(day)
    const hasEntry = entries.some(entry => 
      isSameDay(new Date(entry.entry_date), day)
    )
    
    const calendarDay: CalendarDay = {
      date: day,
      isCurrentMonth,
      isToday: isTodayDate,
      hasEntry,
      isSelected: false,
      dayNumber: day.getDate(),
      weekday: format(day, 'EEEE', { locale: ru })
    }
    
    currentWeek.push(calendarDay)
    
    // Если неделя заполнена (7 дней) или это последний день
    if (currentWeek.length === 7 || day === calendarEnd) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })
  
  return {
    year,
    month,
    monthName: format(date, 'MMMM yyyy', { locale: ru }),
    weeks,
    totalDays: monthEnd.getDate()
  }
}

// Хелпер для получения предыдущего месяца
export const getPreviousMonth = (currentDate: Date): Date => {
  return subMonths(currentDate, 1)
}

// Хелпер для получения следующего месяца
export const getNextMonth = (currentDate: Date): Date => {
  return addMonths(currentDate, 1)
}

// Хелпер для проверки, есть ли записи в определенный день
export const hasEntriesOnDate = (
  date: Date,
  entries: Array<{ entry_date: string }>
): boolean => {
  return entries.some(entry => 
    isSameDay(new Date(entry.entry_date), date)
  )
}

// Хелпер для получения количества записей в определенный день
export const getEntriesCountOnDate = (
  date: Date,
  entries: Array<{ entry_date: string }>
): number => {
  return entries.filter(entry => 
    isSameDay(new Date(entry.entry_date), date)
  ).length
}

// Хелпер для получения записей за определенный день
export const getEntriesOnDate = <T extends { entry_date: string }>(
  date: Date,
  entries: T[]
): T[] => {
  return entries.filter(entry => 
    isSameDay(new Date(entry.entry_date), date)
  )
}

// Хелпер для получения записей за определенный месяц
export const getEntriesForMonth = <T extends { entry_date: string }>(
  date: Date,
  entries: T[]
): T[] => {
  return entries.filter(entry => 
    isSameMonth(new Date(entry.entry_date), date)
  )
}

// Хелпер для получения записей за определенный период
export const getEntriesForPeriod = <T extends { entry_date: string }>(
  startDate: Date,
  endDate: Date,
  entries: T[]
): T[] => {
  return entries.filter(entry => {
    const entryDate = new Date(entry.entry_date)
    return entryDate >= startDate && entryDate <= endDate
  })
}

// Хелпер для форматирования даты для отображения
export const formatDateForDisplay = (date: Date, formatStr: string = 'dd MMMM yyyy'): string => {
  return format(date, formatStr, { locale: ru })
}

// Хелпер для форматирования даты для API
export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

// Хелпер для получения текущего месяца
export const getCurrentMonth = (): Date => {
  return new Date()
}

// Хелпер для проверки, является ли дата выходным
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6 // 0 = воскресенье, 6 = суббота
}

// Хелпер для получения цвета дня в зависимости от статуса
export const getDayColor = (day: CalendarDay): string => {
  if (day.isSelected) {
    return 'bg-primary-500 text-white'
  }
  
  if (day.isToday) {
    return 'bg-primary-100 text-primary-700'
  }
  
  if (day.hasEntry) {
    return 'bg-green-100 text-green-700'
  }
  
  if (day.isCurrentMonth) {
    return 'text-gray-900 hover:bg-gray-100'
  }
  
  return 'text-gray-300'
}

// Хелпер для получения подсказки для дня
export const getDayTooltip = (day: CalendarDay): string => {
  const parts: string[] = []
  
  if (day.isToday) {
    parts.push('Сегодня')
  }
  
  if (day.hasEntry) {
    parts.push('Есть записи')
  }
  
  if (isWeekend(day.date)) {
    parts.push('Выходной')
  }
  
  if (parts.length === 0) {
    parts.push(formatDateForDisplay(day.date, 'dd MMMM yyyy'))
  }
  
  return parts.join(', ')
}

// Хелпер для получения статистики месяца
export const getMonthStats = (
  month: CalendarMonth,
  entries: Array<{ entry_date: string }>
) => {
  const monthEntries = getEntriesForMonth(month.weeks[0][0].date, entries)
  const totalEntries = monthEntries.length
  const daysWithEntries = month.weeks.flat().filter(day => day.hasEntry).length
  const completionRate = Math.round((daysWithEntries / month.totalDays) * 100)
  
  return {
    totalEntries,
    daysWithEntries,
    completionRate,
    totalDays: month.totalDays
  }
}

// Хелпер для получения недели по дате
export const getWeekByDate = (date: Date): Date[] => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  
  return eachDayOfInterval({ start: weekStart, end: weekEnd })
}

// Хелпер для проверки, находится ли дата в текущей неделе
export const isCurrentWeek = (date: Date): boolean => {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  
  return date >= weekStart && date <= weekEnd
}

// Хелпер для получения названия дня недели
export const getDayOfWeekName = (date: Date): string => {
  return format(date, 'EEEE', { locale: ru })
}

// Хелпер для получения короткого названия дня недели
export const getShortDayOfWeekName = (date: Date): string => {
  return format(date, 'EEEEEE', { locale: ru })
}

// Хелпер для получения номера недели в году
export const getWeekNumber = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
}
