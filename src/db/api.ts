import { supabase } from './supabase';
import type { Term, UserProgress, StudyStatus, TermWithProgress } from '@/types/types';

// 获取所有词条
export async function getAllTerms(): Promise<Term[]> {
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .order('order_num', { ascending: true });

  if (error) {
    console.error('获取词条失败:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

// 获取单个词条
export async function getTermById(id: number): Promise<Term | null> {
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('获取词条失败:', error);
    return null;
  }
  return data;
}

// 获取用户的所有学习进度
export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('获取学习进度失败:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

// 获取用户对某个词条的学习进度
export async function getTermProgress(userId: string, termId: number): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('term_id', termId)
    .maybeSingle();

  if (error) {
    console.error('获取词条进度失败:', error);
    return null;
  }
  return data;
}

// 更新或创建学习进度
export async function upsertProgress(
  userId: string,
  termId: number,
  status: StudyStatus
): Promise<boolean> {
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: userId,
        term_id: termId,
        status,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,term_id',
      }
    );

  if (error) {
    console.error('更新学习进度失败:', error);
    return false;
  }
  return true;
}

// 获取用户的学习统计
export async function getUserStats(userId: string): Promise<{
  total: number;
  mastered: number;
  fuzzy: number;
  unfamiliar: number;
  not_studied: number;
}> {
  const [allTerms, userProgress] = await Promise.all([
    getAllTerms(),
    getUserProgress(userId),
  ]);

  const total = allTerms.length;
  const progressMap = new Map(userProgress.map(p => [p.term_id, p.status]));

  let mastered = 0;
  let fuzzy = 0;
  let unfamiliar = 0;
  let not_studied = 0;

  for (const term of allTerms) {
    const status = progressMap.get(term.id) || 'not_studied';
    switch (status) {
      case 'mastered':
        mastered++;
        break;
      case 'fuzzy':
        fuzzy++;
        break;
      case 'unfamiliar':
        unfamiliar++;
        break;
      case 'not_studied':
        not_studied++;
        break;
    }
  }

  return { total, mastered, fuzzy, unfamiliar, not_studied };
}

// 获取带进度的词条列表
export async function getTermsWithProgress(userId: string): Promise<TermWithProgress[]> {
  const [allTerms, userProgress] = await Promise.all([
    getAllTerms(),
    getUserProgress(userId),
  ]);

  const progressMap = new Map(userProgress.map(p => [p.term_id, p]));

  return allTerms.map(term => ({
    ...term,
    progress: progressMap.get(term.id),
  }));
}

// 根据状态筛选词条
export async function getTermsByStatus(
  userId: string,
  status: StudyStatus
): Promise<TermWithProgress[]> {
  const termsWithProgress = await getTermsWithProgress(userId);
  return termsWithProgress.filter(
    term => (term.progress?.status || 'not_studied') === status
  );
}

// 获取随机词条（优先未学习的）
export async function getRandomTerm(userId: string): Promise<TermWithProgress | null> {
  const termsWithProgress = await getTermsWithProgress(userId);
  
  if (termsWithProgress.length === 0) {
    return null;
  }

  // 优先选择未学习的词条
  const notStudiedTerms = termsWithProgress.filter(
    term => !term.progress || term.progress.status === 'not_studied'
  );

  const pool = notStudiedTerms.length > 0 ? notStudiedTerms : termsWithProgress;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
