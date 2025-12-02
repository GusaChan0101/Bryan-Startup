import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Planos de Estudo Personalizados",
      description:
        "Crie e gerencie planos de estudo adaptados às necessidades de cada aluno.",
    },
    {
      icon: Users,
      title: "Gestão de Alunos",
      description:
        "Acompanhe o progresso de todos os seus alunos em um só lugar.",
    },
    {
      icon: BarChart3,
      title: "Análise de Desempenho",
      description:
        "Visualize métricas detalhadas e relatórios de progresso em tempo real.",
    },
    {
      icon: Award,
      title: "Certificações",
      description:
        "Emita certificados automáticos ao completar cursos e módulos.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Alunos Ativos" },
    { value: "500+", label: "Cursos" },
    { value: "95%", label: "Satisfação" },
    { value: "24/7", label: "Suporte" },
  ];

  const benefits = [
    "Interface intuitiva e moderna",
    "Plataforma 100% responsiva",
    "Relatórios em tempo real",
    "Suporte especializado",
    "Atualizações constantes",
    "Segurança de dados",
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Plataforma #1 em Educação Online
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transforme a Educação com{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Tecnologia
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A plataforma completa para gerenciar seus cursos, alunos e planos
              de estudo. Tudo que você precisa em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-primary shadow-glow text-lg h-14 px-8"
                asChild
              >
                <Link to="/student/dashboard">
                  Começar Agora
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8"
                asChild
              >
                <Link to="/admin">Área Administrativa</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Target className="w-4 h-4" />
              Recursos Poderosos
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tudo que Você Precisa
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa com todos os recursos necessários para
              uma gestão educacional eficiente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <CheckCircle2 className="w-4 h-4" />
                Por Que Escolher Nossa Plataforma
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Simplifique sua Gestão Educacional
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Nossa plataforma foi desenvolvida pensando em facilitar a vida
                de educadores e gestores, oferecendo ferramentas intuitivas e
                poderosas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-secondary flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-hero opacity-20 absolute inset-0 blur-3xl"></div>
              <Card className="relative p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="h-4 bg-gradient-primary rounded-full w-3/4"></div>
                  <div className="h-4 bg-muted rounded-full w-full"></div>
                  <div className="h-4 bg-muted rounded-full w-5/6"></div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="h-24 bg-gradient-secondary/20 rounded-lg"></div>
                    <div className="h-24 bg-gradient-primary/20 rounded-lg"></div>
                    <div className="h-24 bg-accent/20 rounded-lg"></div>
                  </div>
                  <div className="h-32 bg-muted rounded-lg"></div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="relative overflow-hidden bg-gradient-hero p-12 text-center text-white">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Pronto para Começar?
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Junte-se a milhares de educadores que já transformaram sua
                forma de ensinar.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg h-14 px-8 shadow-xl"
                asChild
              >
                <Link to="/student/dashboard">
                  Começar Gratuitamente
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground">EduPlataforma</span>
          </div>
          <p className="text-sm">
            © 2024 EduPlataforma. Transformando a educação através da
            tecnologia.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
