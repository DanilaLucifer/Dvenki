-- Исправление RLS проблем и добавление новых функций

-- 1. Исправляем политики для профилей - добавляем INSERT политику
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Исправляем политики для журналов - добавляем просмотр дружеских журналов
CREATE POLICY "Users can view friends journals" 
ON public.journals 
FOR SELECT 
USING (
    visibility = 'friends' AND 
    EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE (requester_id = auth.uid() OR addressee_id = auth.uid()) 
        AND status = 'accepted'
        AND (
            (requester_id = auth.uid() AND addressee_id = user_id) OR
            (addressee_id = auth.uid() AND requester_id = user_id)
        )
    )
);

-- 3. Исправляем политики для записей - добавляем просмотр публичных записей
CREATE POLICY "Users can view public entries" 
ON public.entries 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.journals 
        WHERE id = journal_id AND visibility = 'public'
    )
);

-- 4. Добавляем таблицу для лайков
CREATE TABLE public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL, -- true для лайка, false для дизлайка
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, entry_id)
);

-- RLS для лайков
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" 
ON public.likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own likes" 
ON public.likes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Добавляем таблицу для комментариев
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS для комментариев
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on public entries" 
ON public.comments 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.entries e
        JOIN public.journals j ON e.journal_id = j.id
        WHERE e.id = entry_id AND j.visibility = 'public'
    )
);

CREATE POLICY "Users can view comments on their own entries" 
ON public.comments 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.entries e
        JOIN public.journals j ON e.journal_id = j.id
        WHERE e.id = entry_id AND j.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create comments on public entries" 
ON public.comments 
FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.entries e
        JOIN public.journals j ON e.journal_id = j.id
        WHERE e.id = entry_id AND j.visibility = 'public'
    )
);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Добавляем триггер для обновления updated_at в комментариях
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Исправляем политики для дружбы - добавляем недостающие
CREATE POLICY "Users can delete their own friendship requests" 
ON public.friendships 
FOR DELETE 
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 8. Добавляем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_journals_visibility ON public.journals(visibility);
CREATE INDEX IF NOT EXISTS idx_entries_journal_id ON public.entries(journal_id);
CREATE INDEX IF NOT EXISTS idx_likes_entry_id ON public.likes(entry_id);
CREATE INDEX IF NOT EXISTS idx_comments_entry_id ON public.comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- 9. Исправляем функцию handle_new_user для корректной работы
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Добавляем функцию для подсчета лайков
CREATE OR REPLACE FUNCTION public.get_entry_likes_count(entry_uuid UUID)
RETURNS TABLE(likes_count BIGINT, dislikes_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE is_like = true) as likes_count,
        COUNT(*) FILTER (WHERE is_like = false) as dislikes_count
    FROM public.likes 
    WHERE entry_id = entry_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Добавляем функцию для проверки, лайкнул ли пользователь запись
CREATE OR REPLACE FUNCTION public.has_user_liked_entry(user_uuid UUID, entry_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.likes 
        WHERE user_id = user_uuid AND entry_id = entry_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Обновляем существующие записи для корректной работы
UPDATE public.profiles 
SET display_name = COALESCE(display_name, split_part(
    (SELECT email FROM auth.users WHERE id = user_id), '@', 1
))
WHERE display_name IS NULL;
