"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-lg border-b border-white/10">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <h1 className="text-2xl font-bold tracking-tight">Mindeiro</h1>
          <div className="hidden md:flex gap-8 text-gray-300">
            <a href="#recursos" className="hover:text-white transition">
              Recursos
            </a>
            <a href="#como-funciona" className="hover:text-white transition">
              Como Funciona
            </a>
            <a href="/pricing" className="hover:text-white transition">
              Planos
            </a>
          </div>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">Entrar</Button>
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="pt-40 pb-32 text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight"
        >
          Estude de forma inteligente.
          <br /> Evolua com velocidade.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mt-6"
        >
          O Mindeiro é sua plataforma de estudos com IA, criada para facilitar
          sua evolução e te guiar até sua aprovação.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex justify-center"
        >
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-10 py-6 rounded-xl flex items-center gap-2">
              Começar Agora <ArrowRight size={20} />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="py-32 px-6 bg-black border-t border-white/10">
        <h3 className="text-center text-3xl md:text-5xl font-bold mb-16">
          Recursos Inteligentes
        </h3>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Brain size={40} />,
              title: "Inteligência Adaptativa",
              desc: "Seu estudo evolui conforme seu desempenho, sempre ajustando o nível e o foco.",
            },
            {
              icon: <Zap size={40} />,
              title: "Aprendizado 3x Mais Rápido",
              desc: "Métodos otimizados para acelerar sua memorização e eficiência.",
            },
            {
              icon: <BarChart3 size={40} />,
              title: "Acompanhamento Diário",
              desc: "Gráficos inteligentes mostram sua evolução real ao longo dos dias.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-zinc-900 p-10 rounded-2xl border border-white/10 hover:border-blue-600 transition group"
            >
              <div className="text-blue-500 mb-4">{card.icon}</div>
              <h4 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition">
                {card.title}
              </h4>
              <p className="text-gray-300">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-32 px-6">
        <h3 className="text-center text-3xl md:text-5xl font-bold mb-16">
          Como o Mindeiro Funciona
        </h3>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-14 text-gray-300 text-lg">
          <div>
            <h4 className="text-white text-2xl font-semibold mb-3">
              1. Crie seu perfil
            </h4>
            O sistema entende sua rotina, suas metas e seu nível atual.
          </div>
          <div>
            <h4 className="text-white text-2xl font-semibold mb-3">
              2. Receba um cronograma inteligente
            </h4>
            Ele se adapta diariamente ao seu desempenho.
          </div>
          <div>
            <h4 className="text-white text-2xl font-semibold mb-3">
              3. Estude com IA
            </h4>
            Você aprende mais rápido com explicações claras e exercícios gerados
            sob medida.
          </div>
          <div>
            <h4 className="text-white text-2xl font-semibold mb-3">
              4. Acompanhe seu progresso
            </h4>
            Gráficos e relatórios mostram sua evolução real.
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 px-6 text-center bg-gradient-to-b from-black to-blue-900/20 border-t border-white/10">
        <h3 className="text-3xl md:text-5xl font-bold mb-6">
          Pronto para evoluir de verdade?
        </h3>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg mb-12">
          Comece agora e experimente a plataforma que vai transformar seu jeito
          de estudar.
        </p>
        <Link href="/register">
          <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-10 py-6 rounded-xl flex items-center gap-2">
            Criar Conta <ArrowRight size={20} />
          </Button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-400 border-t border-white/10">
        <p>© 2025 Mindeiro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
