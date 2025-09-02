# Инструкция по настройке проекта Dvenki

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```bash
cp env.example .env.local
```

Заполните переменные в `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jitucedewomjmpqxrxjx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key_из_supabase
```

### 3. Настройка Supabase

1. Перейдите в [Supabase Dashboard](https://app.supabase.com)
2. Выберите проект с ID: `jitucedewomjmpqxrxjx`
3. Скопируйте URL и Anon Key из Settings > API
4. Вставьте их в `.env.local`

**Важно**: База данных уже настроена миграциями в папке `supabase/migrations/`

### 4. Настройка Storage buckets в Supabase

Создайте следующие buckets в Supabase Storage:
- `avatars` - для аватаров пользователей
- `journal-covers` - для обложек журналов  
- `entry-images` - для изображений в записях

### 5. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## ✨ Возможности платформы

- **Аутентификация**: Регистрация, вход, управление профилем
- **Шаблоны журналов**: Готовые шаблоны (благодарность, тренировки, фото, ежедневный, путешествия)
- **Создание журналов**: Персональные журналы с настройками приватности
- **Редактор записей**: Текст, изображения, оценка настроения, календарь
- **Социальные функции**: Друзья, публичные журналы
- **Уведомления**: Настройка напоминаний и push-уведомлений
- **Адаптивный дизайн**: Оптимизация под все устройства

## 🎯 Основные компоненты

- `Auth` - аутентификация с Supabase Auth UI
- `Dashboard` - главная панель с навигацией
- `JournalsList` - список журналов пользователя
- `JournalEditor` - редактор журнала с календарем
- `TemplatesList` - список доступных шаблонов
- `Profile` - управление профилем
- `Friends` - управление друзьями
- `Notifications` - настройки уведомлений

## 🔧 Полезные команды

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен сборки
npm run lint         # Проверка кода
npm run type-check   # Проверка типов TypeScript
```

## 📱 Тестирование

1. Зарегистрируйтесь или войдите в систему
2. Создайте журнал, выбрав шаблон
3. Добавьте записи через редактор
4. Настройте уведомления
5. Добавьте друзей через поиск

## 🔗 Полезные ссылки

- [Supabase Dashboard](https://app.supabase.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

Платформа готова к использованию! 🎉
