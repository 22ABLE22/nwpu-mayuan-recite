import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTermsByStatus } from '@/db/api';
import type { TermWithProgress, StudyStatus } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye } from 'lucide-react';

export default function TermsListPage() {
  const { status } = useParams<{ status: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [terms, setTerms] = useState<TermWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && status) {
      loadTerms(status as StudyStatus);
    }
  }, [user, status]);

  const loadTerms = async (statusFilter: StudyStatus) => {
    if (!user) return;
    setLoading(true);
    const data = await getTermsByStatus(user.id, statusFilter);
    setTerms(data);
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleViewExplanation = (termId: number) => {
    navigate(`/explanation/${termId}`);
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'mastered':
        return { title: '已背过', color: 'text-green-500', bgColor: 'bg-green-500' };
      case 'fuzzy':
        return { title: '模糊', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
      case 'unfamiliar':
        return { title: '没印象', color: 'text-red-500', bgColor: 'bg-red-500' };
      case 'not_studied':
        return { title: '未学习', color: 'text-gray-500', bgColor: 'bg-gray-500' };
      default:
        return { title: '词条列表', color: 'text-primary', bgColor: 'bg-primary' };
    }
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回首页
        </Button>
        <h1 className={`text-2xl font-bold ${statusInfo.color}`}>
          {statusInfo.title} ({terms.length})
        </h1>
      </div>

      {/* 词条列表 */}
      {terms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">暂无词条</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {terms.map((term) => (
            <Card
              key={term.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewExplanation(term.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-3">
                    <span className={`w-1 h-6 ${statusInfo.bgColor} rounded-full`} />
                    <span>#{term.order_num}</span>
                    <span>{term.term}</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
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
          ))}
        </div>
      )}
    </div>
  );
}
