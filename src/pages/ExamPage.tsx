import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTerms } from '@/db/api';
import type { Term } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Home, CheckCircle } from 'lucide-react';

export default function ExamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [examTerms, setExamTerms] = useState<Term[]>([]);
  const [answeredTerms, setAnsweredTerms] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadExamTerms();
    }
  }, [user]);

  const loadExamTerms = async () => {
    setLoading(true);
    const allTerms = await getAllTerms();
    
    // 随机抽取6个词条
    const shuffled = [...allTerms].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 6);
    
    setExamTerms(selected);
    setLoading(false);
  };

  const handleTermClick = (term: Term) => {
    setSelectedTerm(term);
  };

  const handleMarkAnswered = () => {
    if (selectedTerm) {
      setAnsweredTerms(prev => new Set([...prev, selectedTerm.id]));
      setSelectedTerm(null);
    }
  };

  const handleSubmit = () => {
    const answeredCount = answeredTerms.size;
    
    if (answeredCount < 4) {
      setShowConfirmDialog(true);
    } else {
      navigateToResult();
    }
  };

  const navigateToResult = () => {
    const answeredCount = answeredTerms.size;
    navigate('/exam-result', { state: { answeredCount } });
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 顶部导航 */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={handleGoHome}>
          <Home className="h-4 w-4 mr-2" />
          首页
        </Button>
      </div>

      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">模拟考试</h1>
        <p className="text-muted-foreground">请从以下6道题目中任选4道作答。</p>
      </div>

      {/* 词条列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {examTerms.map((term, index) => (
          <Card
            key={term.id}
            className={`cursor-pointer hover:shadow-lg transition-all ${
              answeredTerms.has(term.id) ? 'bg-green-50 border-green-500' : ''
            }`}
            onClick={() => handleTermClick(term)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>题目 {index + 1}</span>
                {answeredTerms.has(term.id) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{term.term}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          className="px-12"
        >
          提交
        </Button>
      </div>

      {/* 词条选择弹窗 */}
      <Dialog open={!!selectedTerm} onOpenChange={(open) => !open && setSelectedTerm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTerm?.term}</DialogTitle>
            <DialogDescription>
              请确认是否已掌握此词条
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Button
              onClick={handleMarkAnswered}
              className="bg-green-500 hover:bg-green-600 text-white px-8"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              已背过
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 确认提交弹窗 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提交</DialogTitle>
            <DialogDescription>
              您作答了 {answeredTerms.size} 道题目，是否确认提交？
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 py-4">
            <Button
              onClick={() => {
                setShowConfirmDialog(false);
                navigateToResult();
              }}
              className="px-8"
            >
              确认
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="px-8">
                取消
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
