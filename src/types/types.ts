// 用户资料类型
export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

// 词条类型
export interface Term {
  id: number;
  term: string;
  explanation: string;
  order_num: number;
}

// 学习状态枚举
export type StudyStatus = 'not_studied' | 'mastered' | 'fuzzy' | 'unfamiliar';

// 用户学习进度类型
export interface UserProgress {
  id: string;
  user_id: string;
  term_id: number;
  status: StudyStatus;
  updated_at: string;
}

// 词条与进度的组合类型
export interface TermWithProgress extends Term {
  progress?: UserProgress;
}
