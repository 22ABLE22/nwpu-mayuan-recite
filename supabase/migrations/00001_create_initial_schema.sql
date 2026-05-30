-- 创建用户资料表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建词条表
CREATE TABLE terms (
  id SERIAL PRIMARY KEY,
  term TEXT NOT NULL,
  explanation TEXT NOT NULL,
  order_num INT NOT NULL UNIQUE
);

-- 创建学习状态枚举
CREATE TYPE study_status AS ENUM ('not_studied', 'mastered', 'fuzzy', 'unfamiliar');

-- 创建用户学习进度表
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  term_id INT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  status study_status NOT NULL DEFAULT 'not_studied',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, term_id)
);

-- 创建索引
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_term_id ON user_progress(term_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);

-- 创建触发器函数：用户确认后自动同步到profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- 从email中提取用户名（格式：username@miaoda.com）
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- profiles表策略
CREATE POLICY "用户可以查看自己的资料" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- terms表策略（所有认证用户可读）
CREATE POLICY "认证用户可以查看所有词条" ON terms
  FOR SELECT TO authenticated USING (true);

-- user_progress表策略
CREATE POLICY "用户可以查看自己的学习进度" ON user_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的学习进度" ON user_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的学习进度" ON user_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的学习进度" ON user_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);