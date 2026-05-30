import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRandomTerm, upsertProgress } from '@/db/api';
import type { TermWithProgress, StudyStatus } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, HelpCircle, XCircle, ArrowRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StudyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTerm, setCurrentTerm] = useState<TermWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRandomTerm();
  }, [user]);

  const loadRandomTerm = async () => {
    if (!user) return;
    setLoading(true);
    const term = await getRandomTerm(user.id);
    setCurrentTerm(term);
    setLoading(false);
  };

  const handleStatusUpdate = async (status: StudyStatus) => {
    if (!user || !currentTerm || updating) return;

    setUpdating(true);
    const success = await upsertProgress(user.id, currentTerm.id, status);
    setUpdating(false);

    if (success) {
      const statusText = {
        mastered: '已背过',
        fuzzy: '模糊',
        unfamiliar: '没印象',
        not_studied: '未学习',
      }[status];

      toast({
        title: '已记录',
        description: `已标记为：${statusText}`,
      });

      // 标记状态后立即跳转到解释页面
      navigate(`/explanation/${currentTerm.id}`);
    } else {
      toast({
        title: '错误',
        description: '记录失败，请重试',
        variant: 'destructive',
      });
    }
  };

  const handleNext = async () => {
    await loadRandomTerm();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentTerm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">暂无可学习的词条</p>
            <Button onClick={handleGoHome}>
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatus = currentTerm.progress?.status || 'not_studied';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* 顶部导航 */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={handleGoHome}>
          <Home className="h-4 w-4 mr-2" />
          首页
        </Button>
        <div className="text-sm text-muted-foreground">
          词条 #{currentTerm.order_num}
        </div>
      </div>

      {/* 词条卡片 */}
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="text-2xl text-center">{currentTerm.term}</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              当前状态：
              <span className={`ml-2 font-semibold ${
                currentStatus === 'mastered' ? 'text-green-500' :
                currentStatus === 'fuzzy' ? 'text-yellow-500' :
                currentStatus === 'unfamiliar' ? 'text-red-500' :
                'text-gray-500'
              }`}>
                {currentStatus === 'mastered' ? '已背过' :
                 currentStatus === 'fuzzy' ? '模糊' :
                 currentStatus === 'unfamiliar' ? '没印象' :
                 '未学习'}
              </span>
            </p>
          </div>

          {/* 状态标记按钮 */}
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground mb-4">请标记您的记忆状态（标记后将查看解释）：</p>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              size="lg"
              onClick={() => handleStatusUpdate('mastered')}
              disabled={updating}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              已背过
            </Button>
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              size="lg"
              onClick={() => handleStatusUpdate('fuzzy')}
              disabled={updating}
            >
              <HelpCircle className="h-5 w-5 mr-2" />
              模糊
            </Button>
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              size="lg"
              onClick={() => handleStatusUpdate('unfamiliar')}
              disabled={updating}
            >
              <XCircle className="h-5 w-5 mr-2" />
              没印象
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 下一题按钮 */}
      <div className="flex justify-center">
        <Button
          size="lg"
          variant="outline"
          className="px-8"
          onClick={handleNext}
          disabled={loading}
        >
          下一题
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
