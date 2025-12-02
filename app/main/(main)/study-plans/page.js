'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, Calendar, Clock, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';

export default function StudyPlansListPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`/api/study-plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setPlans(plans.filter((p) => p.id !== id));
      setShowConfirm(false);
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
    }
  };


  useEffect(() => {
    const fetchPlans = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('/api/study-plans', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        setPlans(data);
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">Meus Planos de Estudo</h1>
            <p className="text-gray-400">
              {plans.length} {plans.length === 1 ? 'plano criado' : 'planos criados'}
            </p>
          </div>
          <Button onClick={() => router.push('/main/study-plans/create')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Plano
          </Button>
        </div>

        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="bg-zinc-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Você tem certeza?</DialogTitle>
              <DialogDescription className="text-gray-400">
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o plano de estudos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirm(false)} className="border-white/20 hover:bg-white/10">Cancelar</Button>
              <Button variant="destructive" onClick={() => handleDelete(deletingId)}>Deletar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {plans.length === 0 ? (
          <Card className="bg-zinc-900 border border-white/10">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Nenhum plano criado</h3>
              <p className="text-gray-400 mb-4">
                Crie seu primeiro plano de estudos personalizado
              </p>
              <Button onClick={() => router.push('/main/study-plans/create')} className="bg-blue-600 hover:bg-blue-700">
                Criar Plano
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const completedLessons = plan.lessons.filter(lesson => lesson.completed).length;
              const totalLessons = plan.lessons.length;
              const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

              return (
                <Card 
                  key={plan.id}
                  className="flex flex-col bg-zinc-900 border border-white/10 hover:border-blue-600/50 transition-all"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-1 text-white">{plan.subject}</CardTitle>
                    <CardDescription className="text-gray-400">{plan.banca} • {plan.escolaridade}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Aulas
                        </span>
                        <span className="font-semibold text-white">{completedLessons}/{totalLessons}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Horas/dia
                        </span>
                        <span className="font-semibold text-white">{plan.daily_hours}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Prova
                        </span>
                        <span className="font-semibold text-white">
                          {new Date(plan.exam_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1 text-gray-300">
                          <span>Progresso</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    <div className="flex gap-2 mt-4">
                      <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" onClick={(e) => { e.stopPropagation(); router.push(`/main/study-plans/${plan.id}`); }}>
                        Ver Plano
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(plan.id);
                          setShowConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}