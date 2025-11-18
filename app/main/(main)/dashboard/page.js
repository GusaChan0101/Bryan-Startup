'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BookOpen, Target, Award, ChevronRight, Clock, Flame, Plus, Calendar, Crown } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyTokenAndFetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/');
        return;
      }

      try {
        // Buscar dados do usuário
        const userRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error('Token validation failed');
        const userData = await userRes.json();
        console.log('User data:', userData);
        setUser(userData);

        // Buscar planos de estudo
        const plansRes = await fetch('/api/study-plans', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setStudyPlans(plansData);
        }

      } catch (error) {
        console.error(error);
        localStorage.removeItem('token');
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };

    verifyTokenAndFetchData();

    const handleStorageChange = (e) => {
      if (e.key === 'data-updated') {
        verifyTokenAndFetchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

    // Calcular estatísticas reais

    const totalLessons = studyPlans.reduce((acc, plan) => acc + (plan.lessons?.length || 0), 0);

    const completedLessons = studyPlans.reduce((acc, plan) => 

      acc + (plan.lessons?.filter(l => l.completed).length || 0), 0

    );

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  

    const stats = [

      {

        title: 'Progresso Total',

        value: `${progressPercentage}%`,

        change: 'Completo',

        changeLabel: 'de todas as aulas',

        icon: TrendingUp,

        color: 'text-blue-600',

        bgColor: 'bg-blue-50 dark:bg-blue-950',

      },

      {

        title: 'Aulas Concluídas',

        value: completedLessons.toString(),

        change: 'Aulas',

        changeLabel: 'concluídas no total',

        icon: BookOpen,

        color: 'text-green-600',

        bgColor: 'bg-green-50 dark:bg-green-950',

      },

      {

        title: 'Planos Ativos',

        value: studyPlans.length.toString(),

        change: 'Ativos',

        changeLabel: 'Continue estudando',

        icon: Flame,

        color: 'text-orange-600',

        bgColor: 'bg-orange-50 dark:bg-orange-950',

      },

    ];

  

    

  

      return (

  

        <>

  

          {/* Header */}

  

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

  

            <div>

  

              <h1 className="text-3xl font-bold tracking-tight text-white">

  

                Olá, {user.name}! 👋

  

              </h1>

  

              <p className="text-gray-400 mt-1">

  

                {studyPlans.length > 0 

  

                  ? 'Bem-vindo de volta! Continue seus estudos.' 

  

                  : 'Comece criando seu primeiro plano de estudos!'}

  

              </p>

  

            </div>

  

            <div className="flex items-center gap-4">

  

              {user?.is_admin && (

  

                <Button 

  

                  size="lg" 

  

                  variant="outline"

  

                  className="gap-2 bg-transparent border-white/20 hover:bg-white/5"

  

                  onClick={() => router.push('/admin')}

  

                >

  

                  <Crown className="h-5 w-5" />

  

                  Painel Admin

  

                </Button>

  

              )}

  

              <Button 

  

                size="lg" 

  

                className="gap-2 bg-blue-600 hover:bg-blue-700"

  

                onClick={() => router.push('/main/study-plans/create')}

  

              >

  

                <Plus className="h-5 w-5" />

  

                Criar Novo Plano

  

              </Button>

  

            </div>

  

          </div>

  

    

  

          {/* Stats Grid */}

  

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

  

            {stats.map((stat, index) => {

  

              const Icon = stat.icon;

  

              return (

  

                <Card key={index} className="bg-zinc-900 border border-white/10 hover:border-blue-600/50 transition-colors">

  

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

  

                    <CardTitle className="text-sm font-medium text-gray-300">

  

                      {stat.title}

  

                    </CardTitle>

  

                    <Icon className={`h-5 w-5 ${stat.color}`} />

  

                  </CardHeader>

  

                  <CardContent>

  

                    <div className="text-2xl font-bold text-white">{stat.value}</div>

  

                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">

  

                      <span className="font-medium">{stat.change}</span>

  

                      <span>{stat.changeLabel}</span>

  

                    </div>

  

                  </CardContent>

  

                </Card>

  

              );

  

            })}

  

          </div>

  

    

  

          {/* Meus Planos de Estudo */}

  

          <Card className="bg-zinc-900 border border-white/10">

  

            <CardHeader>

  

              <div className="flex items-center justify-between">

  

                <div>

  

                  <CardTitle className="text-white">Meus Planos de Estudo</CardTitle>

  

                  <CardDescription className="text-gray-400">

  

                    {studyPlans.length > 0 

  

                      ? `Você tem ${studyPlans.length} ${studyPlans.length === 1 ? 'plano ativo' : 'planos ativos'}`

  

                      : 'Nenhum plano criado ainda'}

  

                  </CardDescription>

  

                </div>

  

                <Button 

  

                  variant="outline" 

  

                  size="sm"

  

                  className="bg-transparent border-white/20 hover:bg-white/5"

  

                  onClick={() => router.push('/main/study-plans')}

  

                >

  

                  Ver Todos

  

                </Button>

  

              </div>

  

            </CardHeader>

  

            <CardContent>

  

              {studyPlans.length === 0 ? (

  

                <div className="text-center py-12">

  

                  <div className="mx-auto w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-4">

  

                    <BookOpen className="h-12 w-12 text-gray-500" />

  

                  </div>

  

                  <h3 className="text-lg font-semibold mb-2 text-white">Nenhum plano criado</h3>

  

                  <p className="text-gray-400 mb-4">

  

                    Crie seu primeiro plano de estudos personalizado com IA

  

                  </p>

  

                  <Button onClick={() => router.push('/main/study-plans/create')} className="bg-blue-600 hover:bg-blue-700">

  

                    <Plus className="h-4 w-4 mr-2" />

  

                    Criar Primeiro Plano

  

                  </Button>

  

                </div>

  

              ) : (

  

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

  

                  {studyPlans.slice(0, 6).map((plan) => {

  

                    const planTotalLessons = plan.lessons?.length || 0;

  

                    const planCompletedLessons = plan.lessons?.filter(l => l.completed).length || 0;

  

                    const planProgress = planTotalLessons > 0 ? Math.round((planCompletedLessons / planTotalLessons) * 100) : 0;

  

    

  

                    return (

  

                      <Card 

  

                        key={plan.id} 

  

                        className="cursor-pointer bg-zinc-900 border border-white/10 hover:border-blue-600/50 transition-all hover:-translate-y-1"

  

                        onClick={() => router.push(`/main/study-plans/${plan.id}`)}

  

                      >

  

                        <CardHeader className="pb-3">

  

                          <div className="flex items-start justify-between">

  

                            <div className="flex-1">

  

                              <CardTitle className="text-lg line-clamp-1 text-white">

  

                                {plan.subject}

  

                              </CardTitle>

  

                              <CardDescription className="mt-1 text-gray-400">

  

                                {plan.banca} • {plan.escolaridade}

  

                              </CardDescription>

  

                            </div>

  

                            <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />

  

                          </div>

  

                        </CardHeader>

  

                        <CardContent>

  

                          <div className="space-y-3">

  

                            <div className="flex items-center justify-between text-sm">

  

                              <span className="text-gray-400">Aulas</span>

  

                              <span className="font-semibold text-white">{planTotalLessons}</span>

  

                            </div>

  

                            <div className="flex items-center justify-between text-sm">

  

                              <span className="text-gray-400">Horas/dia</span>

  

                              <span className="font-semibold text-white">{plan.daily_hours}h</span>

  

                            </div>

  

                            <div className="flex items-center gap-2 text-sm text-gray-400">

  

                              <Calendar className="h-4 w-4" />

  

                              <span>

  

                                {new Date(plan.exam_date).toLocaleDateString('pt-BR')}

  

                              </span>

  

                            </div>

  

                            <div className="mt-3">

  

                              <div className="flex items-center justify-between text-xs mb-1 text-gray-300">

  

                                <span>Progresso</span>

  

                                <span className="font-medium">{planProgress}%</span>

  

                              </div>

  

                              <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">

  

                                <div 

  

                                  className="h-full bg-blue-600 rounded-full transition-all"

  

                                  style={{ width: `${planProgress}%` }}

  

                                />

  

                              </div>

  

                            </div>

  

                          </div>

  

                        </CardContent>

  

                      </Card>

  

                    );

  

                  })}

  

                </div>

  

              )}

  

            </CardContent>

  

          </Card>

  

    

  

          {/* Quick Actions */}

  

          <Card className="bg-zinc-900 border border-white/10">

  

            <CardHeader>

  

              <CardTitle className="text-white">Ações Rápidas</CardTitle>

  

              <CardDescription className="text-gray-400">

  

                Acesso rápido às funcionalidades principais

  

              </CardDescription>

  

            </CardHeader>

  

            <CardContent>

  

              <div className="grid gap-4 md:grid-cols-3">

  

                <Button 

  

                  variant="outline" 

  

                  className="h-24 flex-col gap-2 border-white/20 hover:bg-white/10"

  

                  onClick={() => router.push('/main/study-plans/create')}

  

                >

  

                  <Target className="h-6 w-6" />

  

                  <span>Criar Plano de Estudos</span>

  

                </Button>

  

                <Button 

  

                  variant="outline" 

  

                  className="h-24 flex-col gap-2 border-white/20 hover:bg-white/10"

  

                  onClick={() => router.push('/main/groups')}

  

                >

  

                  <BookOpen className="h-6 w-6" />

  

                  <span>Explorar Grupos</span>

  

                </Button>

  

                <Button 

  

                  variant="outline" 

  

                  className="h-24 flex-col gap-2 border-white/20 hover:bg-white/10"

  

                  onClick={() => router.push('/main/social')}

  

                >

  

                  <Award className="h-6 w-6" />

  

                  <span>Ver Comunidade</span>

  

                </Button>

  

              </div>

  

            </CardContent>

  

          </Card>

  

        </>

  

      );

  

    }

  

    