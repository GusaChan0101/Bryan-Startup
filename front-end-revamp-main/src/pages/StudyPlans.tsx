import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StudyPlans = () => {
  const studyPlans = [
    {
      id: 1,
      title: "Desenvolvimento Web Full Stack",
      description: "Curso completo de desenvolvimento web do básico ao avançado",
      duration: "16 semanas",
      students: 156,
      status: "Ativo",
      progress: 75,
    },
    {
      id: 2,
      title: "Python para Ciência de Dados",
      description: "Aprenda Python aplicado à análise e ciência de dados",
      duration: "12 semanas",
      students: 89,
      status: "Ativo",
      progress: 60,
    },
    {
      id: 3,
      title: "Design UX/UI Moderno",
      description: "Fundamentos e práticas de design de experiência do usuário",
      duration: "10 semanas",
      students: 234,
      status: "Ativo",
      progress: 90,
    },
    {
      id: 4,
      title: "Marketing Digital Avançado",
      description: "Estratégias e técnicas de marketing digital",
      duration: "8 semanas",
      students: 178,
      status: "Em Breve",
      progress: 30,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <div className="pt-24 px-4 pb-12">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  Planos de Estudo
                </h1>
                <p className="text-xl text-muted-foreground">
                  Gerencie seus cursos e planos de aprendizado
                </p>
              </div>
              <Button className="bg-gradient-primary shadow-glow w-fit">
                <Plus className="w-5 h-5 mr-2" />
                Novo Plano
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="p-6 mb-8 animate-scale-in">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Buscar planos de estudo..."
                  className="pl-10 h-12"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-12">
                  Todos
                </Button>
                <Button variant="ghost" className="h-12">
                  Ativos
                </Button>
                <Button variant="ghost" className="h-12">
                  Em Breve
                </Button>
              </div>
            </div>
          </Card>

          {/* Study Plans Grid */}
          <div className="grid gap-6">
            {studyPlans.map((plan, index) => (
              <Card
                key={plan.id}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{plan.title}</h3>
                        <p className="text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold">{plan.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                          style={{ width: `${plan.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{plan.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{plan.students} alunos</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          plan.status === "Ativo"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-accent/20 text-accent"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    <Button variant="outline" className="flex-1 lg:flex-none">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button className="bg-gradient-primary flex-1 lg:flex-none">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State (when no plans) */}
          {studyPlans.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Nenhum plano de estudo encontrado
              </h3>
              <p className="text-muted-foreground mb-6">
                Comece criando seu primeiro plano de estudo
              </p>
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeiro Plano
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlans;
