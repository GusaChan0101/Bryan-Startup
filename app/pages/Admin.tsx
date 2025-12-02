import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  FileText,
  Calendar,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const Admin = () => {
  const stats = [
    {
      icon: Users,
      label: "Total de Alunos",
      value: "1,234",
      change: "+12.5%",
      trend: "up",
    },
    {
      icon: BookOpen,
      label: "Cursos Ativos",
      value: "45",
      change: "+3",
      trend: "up",
    },
    {
      icon: FileText,
      label: "Planos de Estudo",
      value: "89",
      change: "+8",
      trend: "up",
    },
    {
      icon: TrendingUp,
      label: "Taxa de Conclusão",
      value: "87%",
      change: "+5.2%",
      trend: "up",
    },
  ];

  const quickActions = [
    {
      icon: BookOpen,
      title: "Gerenciar Planos de Estudo",
      description: "Criar e editar planos de estudo personalizados",
      href: "/admin/study-plans",
      color: "bg-gradient-primary",
    },
    {
      icon: Users,
      title: "Gerenciar Alunos",
      description: "Visualizar e editar informações dos alunos",
      href: "/admin/students",
      color: "bg-gradient-secondary",
    },
    {
      icon: BarChart3,
      title: "Relatórios",
      description: "Acessar relatórios e análises detalhadas",
      href: "/admin/reports",
      color: "bg-gradient-to-br from-accent to-accent/80",
    },
    {
      icon: Settings,
      title: "Configurações",
      description: "Configurar a plataforma e preferências",
      href: "/admin/settings",
      color: "bg-gradient-to-br from-muted-foreground to-muted-foreground/80",
    },
  ];

  const recentActivity = [
    {
      user: "Maria Silva",
      action: "completou o curso",
      target: "Introdução à Programação",
      time: "2h atrás",
    },
    {
      user: "João Santos",
      action: "iniciou o plano",
      target: "Desenvolvimento Web",
      time: "5h atrás",
    },
    {
      user: "Ana Costa",
      action: "obteve certificado",
      target: "Python Avançado",
      time: "1d atrás",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <div className="pt-24 px-4 pb-12">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Painel Administrativo
            </h1>
            <p className="text-xl text-muted-foreground">
              Gerencie sua plataforma de ensino
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-medium text-secondary">
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                    <div
                      className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {action.description}
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Acessar
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Upcoming */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Atividade Recente</h2>
                <Button variant="ghost" size="sm">
                  Ver Tudo
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {activity.user[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">
                          {activity.action}
                        </span>{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Próximos Eventos</h2>
                <Button variant="ghost" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Calendário
                </Button>
              </div>
              <div className="space-y-4">
                {[
                  {
                    title: "Reunião com Coordenação",
                    date: "Amanhã, 14:00",
                    type: "Reunião",
                  },
                  {
                    title: "Prazo de Entrega - Projeto Final",
                    date: "15/12/2024",
                    type: "Prazo",
                  },
                  {
                    title: "Webinar: Novas Metodologias",
                    date: "20/12/2024",
                    type: "Evento",
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.date}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;