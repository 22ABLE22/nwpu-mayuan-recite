import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStats } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, HelpCircle, XCircle, PlayCircle, FileText, Search } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    mastered: 0,
    fuzzy: 0,
    unfamiliar: 0,
    not_studied: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getUserStats(user.id);
    setStats(data);
    setLoading(false);
  };

  const handleStart = () => {
    navigate('/study');
  };

  const handleExam = () => {
    navigate('/exam');
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const handleViewTerms = (status: string) => {
    navigate(`/terms/${status}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progress = stats.total > 0 ? ((stats.mastered / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">马原名词解释背诵助手</h1>
        <p className="text-muted-foreground">掌握180个马克思主义原理核心概念</p>
      </div>

      {/* 总体进度卡片 */}
      <Card className="mb-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>学习进度</span>
          </CardTitle>
          <CardDescription>已掌握 {stats.mastered} / {stats.total} 个词条</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>完成度</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary rounded-full h-3 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
          onClick={() => handleViewTerms('mastered')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>已背过</span>
              </span>
              <span className="text-2xl font-bold text-green-500">{stats.mastered}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">点击查看已掌握的词条</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500"
          onClick={() => handleViewTerms('fuzzy')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-yellow-500" />
                <span>模糊</span>
              </span>
              <span className="text-2xl font-bold text-yellow-500">{stats.fuzzy}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">点击查看需要复习的词条</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-red-500"
          onClick={() => handleViewTerms('unfamiliar')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span>没印象</span>
              </span>
              <span className="text-2xl font-bold text-red-500">{stats.unfamiliar}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">点击查看不熟悉的词条</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-gray-500"
          onClick={() => handleViewTerms('not_studied')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-gray-500" />
                <span>未学习</span>
              </span>
              <span className="text-2xl font-bold text-gray-500">{stats.not_studied}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">点击查看未学习的词条</p>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          size="lg"
          variant="outline"
          className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          onClick={handleSearch}
        >
          <Search className="h-6 w-6 mr-2" />
          搜索词库
        </Button>
        <Button
          size="lg"
          className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          onClick={handleStart}
        >
          <PlayCircle className="h-6 w-6 mr-2" />
          开始背诵
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          onClick={handleExam}
        >
          <FileText className="h-6 w-6 mr-2" />
          模拟考试
        </Button>
      </div>
    </div>
  );
}
