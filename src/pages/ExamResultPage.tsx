import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, RefreshCw, Trophy, TrendingUp } from 'lucide-react';

export default function ExamResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    const state = location.state as { answeredCount?: number };
    const count = state?.answeredCount || 0;
    setAnsweredCount(count);

    // 计算得分：1题10分，2题20分，3题30分，4题及以上40分
    let calculatedScore = 0;
    if (count === 1) calculatedScore = 10;
    else if (count === 2) calculatedScore = 20;
    else if (count === 3) calculatedScore = 30;
    else if (count >= 4) calculatedScore = 40;

    setScore(calculatedScore);
  }, [location]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    navigate('/exam');
  };

  const isGoodScore = score >= 25;
  const encouragement = isGoodScore ? '你真棒' : '加油';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">考试结果</h1>
      </div>

      {/* 得分卡片 */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isGoodScore ? (
              <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            ) : (
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-6xl font-bold text-primary mb-2">{score}</p>
            <p className="text-xl text-muted-foreground">分</p>
          </div>
          
          <div className="py-4 border-t border-b">
            <p className="text-3xl font-bold mb-2">{encouragement}</p>
            <p className="text-muted-foreground">
              您作答了 {answeredCount} 道题目
            </p>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>评分标准：</p>
            <p>1题 = 10分 | 2题 = 20分 | 3题 = 30分</p>
            <p>4题及以上 = 40分</p>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={handleGoHome}
          className="px-8"
        >
          <Home className="h-5 w-5 mr-2" />
          返回主页
        </Button>
        <Button
          size="lg"
          onClick={handleRetry}
          className="px-8"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          再试一次
        </Button>
      </div>
    </div>
  );
}
