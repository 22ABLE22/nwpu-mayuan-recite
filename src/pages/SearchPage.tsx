import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTermsWithProgress } from '@/db/api';
import type { TermWithProgress } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Eye, Search } from 'lucide-react';

// 根据进度状态返回对应颜色
function getStatusStyle(status?: string) {
  switch (status) {
    case 'mastered':
      return { bar: 'bg-green-500', label: '已背过', text: 'text-green-500' };
    case 'fuzzy':
      return { bar: 'bg-yellow-500', label: '模糊', text: 'text-yellow-500' };
    case 'unfamiliar':
      return { bar: 'bg-red-500', label: '没印象', text: 'text-red-500' };
    default:
      return { bar: 'bg-gray-400', label: '未学习', text: 'text-gray-400' };
  }
}

export default function SearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allTerms, setAllTerms] = useState<TermWithProgress[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTerms();
    }
  }, [user]);

  const loadTerms = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getTermsWithProgress(user.id);
    setAllTerms(data);
    setLoading(false);
  };

  // 前端模糊搜索：同时匹配词条名称和解释内容
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return allTerms;
    const lower = q.toLowerCase();
    return allTerms.filter(
      t =>
        t.term.toLowerCase().includes(lower) ||
        t.explanation.toLowerCase().includes(lower)
    );
  }, [query, allTerms]);

  const handleViewExplanation = (termId: number) => {
    navigate(`/explanation/${termId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回首页
        </Button>
        <h1 className="text-2xl font-bold text-primary">搜索词库</h1>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="搜索词条名称或解释内容…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* 结果数量提示 */}
      <p className="text-sm text-muted-foreground mb-4">
        {query.trim()
          ? `找到 ${filtered.length} 条相关词条`
          : `共 ${allTerms.length} 个词条`}
      </p>

      {/* 词条列表 */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">未找到相关词条</p>
            <p className="text-sm text-muted-foreground mt-1">请尝试其他关键词</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(term => {
            const style = getStatusStyle(term.progress?.status);
            return (
              <Card
                key={term.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewExplanation(term.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-3">
                      <span className={`w-1 h-6 ${style.bar} rounded-full shrink-0`} />
                      <span className="text-muted-foreground text-sm">#{term.order_num}</span>
                      <span>{term.term}</span>
                      <span className={`text-xs font-normal ${style.text}`}>{style.label}</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleViewExplanation(term.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {term.explanation}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
