import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTermById, getRandomTerm } from '@/db/api';
import type { Term } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function ExplanationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [term, setTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);

  useEffect(() => {
    if (id) {
      loadTerm(Number.parseInt(id));
    }
  }, [id]);

  const loadTerm = async (termId: number) => {
    setLoading(true);
    const data = await getTermById(termId);
    setTerm(data);
    setLoading(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = async () => {
    if (!user) return;
    setLoadingNext(true);
    const nextTerm = await getRandomTerm(user.id);
    setLoadingNext(false);
    if (nextTerm) {
      navigate(`/study`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!term) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">词条不存在</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
      </div>

      {/* 词条解释卡片 */}
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{term.term}</CardTitle>
            <span className="text-sm text-muted-foreground">#{term.order_num}</span>
          </div>
        </CardHeader>
        <CardContent className="py-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {term.explanation}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 下一题按钮 */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={loadingNext}
          className="px-8"
        >
          下一题
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
