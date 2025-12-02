"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userToken = localStorage.getItem('token');
    setToken(userToken);
    if (!userToken) return;

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleGetStarted = (plan) => {
    if (user) {
      redirectToCheckout(plan);
    } else {
      router.push('/login');
    }
  };

  const redirectToCheckout = async (plan) => {
    try {
      const res = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe checkout error:', error.message);
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-lg border-b border-white/10">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">Mindeiro</Link>
          <div className="hidden md:flex gap-8 text-gray-300">
             <Link href="/#recursos" className="hover:text-white transition">Recursos</Link>
             <Link href="/#como-funciona" className="hover:text-white transition">Como Funciona</Link>
             <Link href="/pricing" className="hover:text-white transition">Planos</Link>
           </div>
          {user ? (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/main/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </nav>
      </header>
      <main className="flex-1 pt-20">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Planos de Preços para Todos</h1>
                <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Escolha o plano que melhor se adapta às suas necessidades de estudo. Comece gratuitamente ou desbloqueie recursos avançados com nosso plano Pro.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-md gap-8 py-12 sm:max-w-lg lg:max-w-none lg:grid-cols-2">
              <Card className="bg-zinc-900 border border-white/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white">Grátis</CardTitle>
                  <CardDescription className="text-gray-400">
                    Perfeito para estudantes que estão começando.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="text-4xl font-bold text-white">R$0/mês</div>
                  <ul className="grid gap-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Criação de planos de estudo básicos</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Acompanhamento de progresso</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Acesso a ferramentas de estudo</li>
                  </ul>
                  <Button onClick={() => router.push('/register')} variant="outline" className="w-full border-white/20 hover:bg-white/10">
                    Começar
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-600 bg-zinc-900">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white">Pro</CardTitle>
                  <CardDescription className="text-gray-400">
                    Desbloqueie todo o potencial do Mindeiro com nosso plano Pro.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="text-4xl font-bold text-white">R$10/mês</div>
                  <ul className="grid gap-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Criação avançada de planos de estudo com IA</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Análise detalhada do progresso</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Ferramentas de estudo interativas</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Suporte prioritário</li>
                  </ul>
                  <Button onClick={() => handleGetStarted('pro')} className="w-full bg-blue-600 hover:bg-blue-700">
                    Atualizar para Pro
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-10 text-center text-gray-400 border-t border-white/10">
        <p>© 2025 Mindeiro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}