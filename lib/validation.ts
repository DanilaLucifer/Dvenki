import { z } from 'zod'

// Схема для профиля пользователя
export const profileSchema = z.object({
  display_name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50, 'Имя не должно превышать 50 символов'),
  bio: z.string().max(500, 'Биография не должна превышать 500 символов').optional(),
})

// Схема для создания журнала
export const createJournalSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа').max(100, 'Название не должно превышать 100 символов'),
  description: z.string().max(500, 'Описание не должно превышать 500 символов').optional(),
  template_id: z.string().uuid().optional(),
  visibility: z.enum(['private', 'friends', 'public']),
})

// Схема для записи в журнале
export const createEntrySchema = z.object({
  title: z.string().max(200, 'Заголовок не должен превышать 200 символов').optional(),
  content: z.string().min(1, 'Содержание обязательно для заполнения').max(10000, 'Содержание не должно превышать 10000 символов'),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты'),
  mood: z.number().min(1).max(5).optional(),
  is_published: z.boolean(),
})

// Схема для поиска пользователей
export const searchUsersSchema = z.object({
  query: z.string().min(2, 'Поисковый запрос должен содержать минимум 2 символа').max(100, 'Поисковый запрос не должен превышать 100 символов'),
})

// Схема для настроек уведомлений
export const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  daily_reminders: z.boolean(),
  weekly_summary: z.boolean(),
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат времени'),
})

// Схема для загрузки изображения
export const imageUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'Размер файла не должен превышать 5MB'
  ).refine(
    (file) => file.type.startsWith('image/'),
    'Файл должен быть изображением'
  ),
})

// Схема для комментария
export const commentSchema = z.object({
  content: z.string().min(1, 'Комментарий не может быть пустым').max(1000, 'Комментарий не должен превышать 1000 символов'),
})

// Схема для фильтров журналов
export const journalFiltersSchema = z.object({
  type: z.string().optional(),
  visibility: z.enum(['private', 'friends', 'public']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
})

// Схема для пагинации
export const paginationSchema = z.object({
  page: z.number().min(1, 'Номер страницы должен быть больше 0'),
  limit: z.number().min(1, 'Лимит должен быть больше 0').max(100, 'Лимит не должен превышать 100'),
})

// Схема для сортировки
export const sortSchema = z.object({
  field: z.enum(['created_at', 'updated_at', 'title', 'entry_date']),
  order: z.enum(['asc', 'desc']),
})

// Валидация email
export const emailSchema = z.string().email('Неверный формат email')

// Валидация пароля
export const passwordSchema = z.string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать хотя бы одну букву, одну заглавную букву и одну цифру')

// Схема для регистрации
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

// Схема для входа
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Пароль обязателен'),
})

// Схема для восстановления пароля
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

// Схема для изменения пароля
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Новые пароли не совпадают",
  path: ["confirmNewPassword"],
})

// Экспорт типов
export type ProfileFormData = z.infer<typeof profileSchema>
export type CreateJournalFormData = z.infer<typeof createJournalSchema>
export type CreateEntryFormData = z.infer<typeof createEntrySchema>
export type SearchUsersFormData = z.infer<typeof searchUsersSchema>
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>
export type ImageUploadFormData = z.infer<typeof imageUploadSchema>
export type CommentFormData = z.infer<typeof commentSchema>
export type JournalFiltersFormData = z.infer<typeof journalFiltersSchema>
export type PaginationFormData = z.infer<typeof paginationSchema>
export type SortFormData = z.infer<typeof sortSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
