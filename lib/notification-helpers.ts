// Хелпер для запроса разрешения на push-уведомления
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Этот браузер не поддерживает уведомления')
    return 'denied'
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

// Хелпер для проверки поддержки уведомлений
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window
}

// Хелпер для проверки разрешения на уведомления
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.permission
}

// Хелпер для отправки push-уведомления
export const sendPushNotification = (
  title: string,
  options?: NotificationOptions
): boolean => {
  if (!isNotificationSupported()) {
    console.warn('Уведомления не поддерживаются в этом браузере')
    return false
  }

  if (Notification.permission !== 'granted') {
    console.warn('Разрешение на уведомления не получено')
    return false
  }

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })
    return true
  } catch (error) {
    console.error('Ошибка при отправке уведомления:', error)
    return false
  }
}

// Хелпер для отправки уведомления о напоминании
export const sendReminderNotification = (
  journalTitle: string,
  message: string
): boolean => {
  return sendPushNotification(
    `Напоминание: ${journalTitle}`,
    {
      body: message,
      tag: 'reminder',
      requireInteraction: false,
      silent: false
    }
  )
}

// Хелпер для отправки уведомления о новой записи
export const sendNewEntryNotification = (
  journalTitle: string,
  entryTitle?: string
): boolean => {
  const message = entryTitle 
    ? `Новая запись "${entryTitle}" в журнале "${journalTitle}"`
    : `Новая запись в журнале "${journalTitle}"`

  return sendPushNotification(
    'Новая запись',
    {
      body: message,
      tag: 'new-entry',
      requireInteraction: false,
      silent: false
    }
  )
}

// Хелпер для отправки уведомления о друге
export const sendFriendNotification = (
  friendName: string,
  action: 'request' | 'accepted' | 'declined'
): boolean => {
  const messages = {
    request: `Пользователь ${friendName} хочет добавить вас в друзья`,
    accepted: `Пользователь ${friendName} принял ваш запрос в друзья`,
    declined: `Пользователь ${friendName} отклонил ваш запрос в друзья`
  }

  const titles = {
    request: 'Новый запрос в друзья',
    accepted: 'Запрос в друзья принят',
    declined: 'Запрос в друзья отклонен'
  }

  return sendPushNotification(
    titles[action],
    {
      body: messages[action],
      tag: `friend-${action}`,
      requireInteraction: true,
      silent: false
    }
  )
}

// Хелпер для отправки уведомления об ошибке
export const sendErrorNotification = (
  title: string,
  message: string
): boolean => {
  return sendPushNotification(
    `Ошибка: ${title}`,
    {
      body: message,
      tag: 'error',
      requireInteraction: true,
      silent: false
    }
  )
}

// Хелпер для отправки уведомления об успехе
export const sendSuccessNotification = (
  title: string,
  message: string
): boolean => {
  return sendPushNotification(
    title,
    {
      body: message,
      tag: 'success',
      requireInteraction: false,
      silent: true
    }
  )
}

// Хелпер для настройки периодических уведомлений
export const setupPeriodicNotifications = (
  callback: () => void,
  interval: number = 60000 // 1 минута по умолчанию
): number | null => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null
  }

  try {
    const intervalId = setInterval(callback, interval)
    return intervalId
  } catch (error) {
    console.error('Ошибка при настройке периодических уведомлений:', error)
    return null
  }
}

// Хелпер для остановки периодических уведомлений
export const stopPeriodicNotifications = (intervalId: number | null): void => {
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
}

// Хелпер для проверки времени для отправки уведомления
export const shouldSendNotification = (
  reminderTime: string,
  currentTime: Date = new Date()
): boolean => {
  const [hours, minutes] = reminderTime.split(':').map(Number)
  const reminderDate = new Date()
  reminderDate.setHours(hours, minutes, 0, 0)

  const timeDiff = Math.abs(currentTime.getTime() - reminderDate.getTime())
  const timeThreshold = 5 * 60 * 1000 // 5 минут

  return timeDiff <= timeThreshold
}

// Хелпер для форматирования времени напоминания
export const formatReminderTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Хелпер для получения следующего времени напоминания
export const getNextReminderTime = (
  reminderTime: string,
  currentTime: Date = new Date()
): Date => {
  const [hours, minutes] = reminderTime.split(':').map(Number)
  const nextReminder = new Date(currentTime)
  
  nextReminder.setHours(hours, minutes, 0, 0)
  
  // Если время уже прошло сегодня, устанавливаем на завтра
  if (nextReminder <= currentTime) {
    nextReminder.setDate(nextReminder.getDate() + 1)
  }
  
  return nextReminder
}

// Хелпер для расчета времени до следующего напоминания
export const getTimeUntilNextReminder = (
  reminderTime: string,
  currentTime: Date = new Date()
): number => {
  const nextReminder = getNextReminderTime(reminderTime, currentTime)
  return nextReminder.getTime() - currentTime.getTime()
}

// Хелпер для создания текста напоминания
export const createReminderText = (
  journalTitle: string,
  type: 'daily' | 'weekly' | 'custom' = 'daily'
): string => {
  const messages = {
    daily: `Время для ежедневной записи в журнале "${journalTitle}"`,
    weekly: `Время для еженедельного обзора журнала "${journalTitle}"`,
    custom: `Напоминание о журнале "${journalTitle}"`
  }

  return messages[type]
}

// Хелпер для проверки настроек уведомлений
export const checkNotificationSettings = (settings: {
  push_notifications: boolean
  daily_reminders: boolean
  reminder_time: string
}): boolean => {
  return (
    settings.push_notifications &&
    settings.daily_reminders &&
    isNotificationSupported() &&
    getNotificationPermission() === 'granted'
  )
}
