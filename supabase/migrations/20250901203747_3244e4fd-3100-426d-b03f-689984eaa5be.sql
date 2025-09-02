-- Создание базы данных для платформы журналов

-- Таблица профилей пользователей
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для профилей
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Политики для профилей
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Шаблоны журналов
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'gratitude', 'workout', 'photo', 'daily', 'travel' etc.
    cover_image TEXT,
    prompt_text TEXT, -- подсказка для записи
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS для шаблонов
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by everyone" 
ON public.templates 
FOR SELECT 
USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create templates" 
ON public.templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" 
ON public.templates 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Журналы пользователей
CREATE TABLE public.journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    visibility TEXT NOT NULL DEFAULT 'private', -- 'private', 'friends', 'public'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS для журналов
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journals" 
ON public.journals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public journals" 
ON public.journals 
FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Users can create their own journals" 
ON public.journals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals" 
ON public.journals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals" 
ON public.journals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Записи в журналах
CREATE TABLE public.entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5), -- оценка настроения 1-5
    images TEXT[], -- массив URL изображений
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS для записей
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view entries in their own journals" 
ON public.entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create entries in their own journals" 
ON public.entries 
FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
        SELECT 1 FROM public.journals 
        WHERE id = journal_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own entries" 
ON public.entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Таблица друзей
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- RLS для дружбы
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships" 
ON public.friendships 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests" 
ON public.friendships 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendship requests sent to them" 
ON public.friendships 
FOR UPDATE 
USING (auth.uid() = addressee_id AND status = 'pending');

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автообновления timestamp
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journals_updated_at
    BEFORE UPDATE ON public.journals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON public.entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Создание триггера для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Вставляем базовые шаблоны
INSERT INTO public.templates (name, description, type, prompt_text, is_public) VALUES
('Дневник благодарности', 'Записывайте то, за что благодарны каждый день', 'gratitude', 'За что я благодарен сегодня?', true),
('Дневник тренировок', 'Отслеживайте свои физические упражнения и прогресс', 'workout', 'Какие упражнения я выполнил сегодня?', true),
('Фотодневник', 'Делитесь моментами дня через фотографии', 'photo', 'Какой момент дня запомнился больше всего?', true),
('Ежедневный журнал', 'Записывайте мысли и события каждого дня', 'daily', 'Как прошел мой день? Что я узнал?', true),
('Журнал путешествий', 'Ведите записи о ваших поездках и приключениях', 'travel', 'Что нового я открыл сегодня в путешествии?', true);