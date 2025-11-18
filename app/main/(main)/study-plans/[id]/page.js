'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudyPlanPage() {
  const params = useParams();
  const { id } = params;
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchStudyPlan = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Você precisa estar logado para ver os detalhes do plano de estudos.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/study-plans/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Plano de estudos não encontrado ou não autorizado');
        }
        const data = await res.json();
        setStudyPlan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyPlan();
  }, [id]);

  const handleCompleteLesson = async (lessonId) => {
    const updatedLessons = studyPlan.lessons.map(lesson =>
      lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson
    );

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Você precisa estar logado para completar uma aula.');
      return;
    }

    try {
      const res = await fetch(`/api/study-plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ lessons: updatedLessons }),
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar a aula');
      }

      const data = await res.json();
      setStudyPlan(data);
      localStorage.setItem('data-updated', Date.now());
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!studyPlan) {
    return <div>Plano de estudos não encontrado.</div>;
  }

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="w-full flex-1">
          <h1 className="text-lg font-semibold">{studyPlan.subject}</h1>
        </div>
      </header>
      <div className="grid gap-4">
        {studyPlan.lessons.map((lesson) => (
          <Card key={lesson.id} className={lesson.completed ? 'bg-muted/50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{lesson.title}</CardTitle>
                <Button
                  size="sm"
                  variant={lesson.completed ? 'secondary' : 'primary'}
                  onClick={() => handleCompleteLesson(lesson.id)}
                >
                  {lesson.completed ? 'Desmarcar' : 'Concluir'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p>{lesson.detailed_content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
