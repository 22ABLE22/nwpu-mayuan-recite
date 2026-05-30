import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import StudyPage from './pages/StudyPage';
import ExplanationPage from './pages/ExplanationPage';
import TermsListPage from './pages/TermsListPage';
import ExamPage from './pages/ExamPage';
import ExamResultPage from './pages/ExamResultPage';
import SearchPage from './pages/SearchPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <HomePage />,
  },
  {
    name: '登录',
    path: '/login',
    element: <LoginPage />,
  },
  {
    name: '答题',
    path: '/study',
    element: <StudyPage />,
  },
  {
    name: '解释',
    path: '/explanation/:id',
    element: <ExplanationPage />,
  },
  {
    name: '词条列表',
    path: '/terms/:status',
    element: <TermsListPage />,
  },
  {
    name: '模拟考试',
    path: '/exam',
    element: <ExamPage />,
  },
  {
    name: '考试结果',
    path: '/exam-result',
    element: <ExamResultPage />,
  },
  {
    name: '搜索词库',
    path: '/search',
    element: <SearchPage />,
  },
];

export default routes;
