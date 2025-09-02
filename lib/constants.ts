export const APP_NAME = 'Dvenki'
export const APP_DESCRIPTION = 'Платформа для создания пользовательского контента по расписанию'

export const TEMPLATE_TYPES = {
  gratitude: 'gratitude',
  workout: 'workout',
  photo: 'photo',
  daily: 'daily',
  travel: 'travel'
} as const

export const TEMPLATE_TYPE_LABELS = {
  [TEMPLATE_TYPES.gratitude]: 'Благодарность',
  [TEMPLATE_TYPES.workout]: 'Тренировки',
  [TEMPLATE_TYPES.photo]: 'Фото',
  [TEMPLATE_TYPES.daily]: 'Ежедневный',
  [TEMPLATE_TYPES.travel]: 'Путешествия'
} as const

export const VISIBILITY_OPTIONS = {
  private: 'private',
  friends: 'friends',
  public: 'public'
} as const

export const VISIBILITY_LABELS = {
  [VISIBILITY_OPTIONS.private]: 'Приватный',
  [VISIBILITY_OPTIONS.friends]: 'Для друзей',
  [VISIBILITY_OPTIONS.public]: 'Публичный'
} as const

export const FRIENDSHIP_STATUS = {
  pending: 'pending',
  accepted: 'accepted',
  declined: 'declined'
} as const

export const FRIENDSHIP_STATUS_LABELS = {
  [FRIENDSHIP_STATUS.pending]: 'Ожидает ответа',
  [FRIENDSHIP_STATUS.accepted]: 'Принят',
  [FRIENDSHIP_STATUS.declined]: 'Отклонен'
} as const

export const MOOD_OPTIONS = [1, 2, 3, 4, 5] as const

export const DEFAULT_REMINDER_TIME = '09:00'

export const STORAGE_BUCKETS = {
  avatars: 'avatars',
  journalCovers: 'journal-covers',
  entryImages: 'entry-images'
} as const
