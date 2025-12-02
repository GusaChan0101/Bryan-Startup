import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  ChevronRight,
  Play,
  CheckCircle2,
  Award,
  Calendar,
} from "lucide-react";

const StudentDashboard = () => {
  const stats = [
    {
      icon: BookOpen,
      label: "Cursos em Andamento",
      value: "4",
      color: "bg-gradient-primary",
    },
    {
      icon: Trophy,
      label: "Certificados",
      value: "12",
      color: "bg-gradient-secondary",
    },
    {
      icon: Clock,
      label: "Horas de Estudo",
      value: "156h",
      color: "bg-gradient-to-br from-accent to-accent/80",
    },
    {
      icon: TrendingUp,
      label: "Taxa de Conclusão",
      value: "89%",
      color: "bg-gradient-to-br from-primary to-secondary",
    },
  ];

  const courses = [
    {
      title: "Desenvolvimento Web Full Stack",
      progress: 65,
      nextLesson: "React Hooks Avançados",
      duration: "45min",
      status: "Em Andamento",
    },
    {
      title: "Python para Ciência de Dados",
      progress: 80,
      nextLesson: "Machine Learning Básico",
      duration: "1h 20min",
      status: "Em Andamento",
    },
    {
      title: "Design UX/UI Moderno",
      progress: 45,
      nextLesson: "Prototipagem no Figma",
      duration: "30min",
      status: "Em Andamento",
    },
  ];

  const achievements = [
    {
      title: "Primeira Conclusão",
      description: "Complete seu primeiro curso",
      earned: true,
    },
    {
      title: "Estudante Dedicado",
      description: "100 horas de estudo",
      earned: true,
    },
    {
      title: "Mestre da Consistência",
      description: "7 dias consecutivos",
      earned: true,
    },
    {
      title: "Expert em Programação",
      description: "Complete 5 cursos de código",
      earned: false,
    },
  ];

  const upcomingDeadlines = [
    {
      title: "Projeto Final - Web Dev",
      date: "Em 3 dias",
      priority: "high",
    },
    {
      title: "Quiz - Python Módulo 5",
      date: "Em 5 dias",
      priority: "medium",
    },
    {
      title: "Exercícios - UX Design",
      date: "Em 1 semana",
      priority: "low",
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
              Meu Aprendizado
            </h1>
            <p className="text-xl text-muted-foreground">
              Continue de onde você parou
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${stat.color} flex items-center justify-center mb-3 md:mb-4`}
                >
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - Courses */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Meus Cursos
                  </h2>
                  <Button variant="ghost">Ver Todos</Button>
                </div>

                <div className="space-y-4">
                  {courses.map((course, index) => (
                    <Card
                      key={index}
                      className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-bold mb-2">
                            {course.title}
                          </h3>

                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">
                                Progresso
                              </span>
                              <span className="font-semibold">
                                {course.progress}%
                              </span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              <span>{course.nextLesson}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{course.duration}</span>
                            </div>
                          </div>
                        </div>

                        <Button className="bg-gradient-primary shadow-glow w-full md:w-auto">
                          Continuar
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Conquistas
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card
                      key={index}
                      className={`p-4 ${
                        achievement.earned
                          ? "border-2 border-secondary"
                          : "opacity-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg ${
                            achievement.earned
                              ? "bg-gradient-secondary"
                              : "bg-muted"
                          } flex items-center justify-center flex-shrink-0`}
                        >
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1">
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.earned && (
                          <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Study Streak */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Sequência de Estudos</h3>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                    7
                  </div>
                  <div className="text-sm text-muted-foreground">
                    dias consecutivos
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Deadlines */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Próximos Prazos</h3>
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border-2 border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm mb-1">
                            {deadline.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {deadline.date}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                            deadline.priority === "high"
                              ? "bg-destructive/20 text-destructive"
                              : deadline.priority === "medium"
                              ? "bg-accent/20 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {deadline.priority === "high"
                            ? "Urgente"
                            : deadline.priority === "medium"
                            ? "Médio"
                            : "Baixo"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 bg-gradient-hero text-white">
                <h3 className="text-xl font-bold mb-4">Esta Semana</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold mb-1">12h 30min</div>
                    <div className="text-sm text-white/80">Tempo de estudo</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">8</div>
                    <div className="text-sm text-white/80">
                      Lições completadas
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">100%</div>
                    <div className="text-sm text-white/80">Taxa de presença</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
