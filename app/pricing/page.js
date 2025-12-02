"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

// const mpPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY; // Not needed for subscription button

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false); // To prevent hydration errors
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const userToken = localStorage.getItem('token');
    console.log("Frontend - Token from localStorage:", userToken); // Log token from localStorage
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

  const createSubscriptionPlan = async (plan) => { // Renamed from createPreference
    console.log("Creating subscription plan...");
    console.log("Frontend - Token sent in header:", token); // Log token being sent
    try {
      const res = await fetch('/api/mercadopago/create-subscription-plan', { // New API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to create subscription plan, API responded with error:", errorData);
        throw new Error(errorData.error || 'Failed to create subscription plan');
      }

      const { init_point } = await res.json(); // Expect init_point
      console.log("Subscription plan created successfully. Redirecting to:", init_point);
      // setInitPoint(init_point); // If you want to render a button that redirects
      router.push(init_point); // Redirect to Mercado Pago
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      alert(`Ocorreu um erro ao iniciar a assinatura: ${error.message}`);
    }
  };

  const handleGetStarted = (plan) => { // This will now trigger the API call directly
    console.log("handleGetStarted called with plan:", plan);
    console.log("handleGetStarted - Current user state:", user); // Add this log
    if (user) {
      createSubscriptionPlan(plan);
    } else {
      console.log("User not logged in, redirecting to /login");
      router.push('/login');
      console.log("Frontend - Redirected to /login"); // Log redirection
    }
  };

  const handlePayWithPix = async (plan) => {
    if (!token) {
        alert("Você precisa estar logado para fazer o pagamento com PIX.");
        router.push('/login');
        return;
    }

    setIsLoadingPix(true);
    try {
        const res = await fetch('/api/mercadopago/create-pix-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ plan }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to create PIX payment');
        }

        const data = await res.json();
        setPixData(data);
        setIsPixModalOpen(true);
    } catch (error) {
        console.error('Error creating PIX payment:', error);
        alert(`Ocorreu um erro ao gerar o PIX: ${error.message}`);
    } finally {
        setIsLoadingPix(false);
    }
  };

  return (
    <>
      {/* Mercado Pago Subscription Button Script from buton.txt */}
      <Script
        src={"https://secure.mlstatic.com/mptools/render.js"} // Corrected protocol usage
        strategy="lazyOnload" // Use lazyOnload to avoid hydration issues
      />
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
                    {/* The subscription button will be rendered dynamically */}
                    {isClient && (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleGetStarted('pro')}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Assinar (Cartão de Crédito)
                        </Button>
                        <Button
                          onClick={() => handlePayWithPix('pro')}
                          variant="outline"
                          className="w-full border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                          disabled={isLoadingPix}
                        >
                          {isLoadingPix ? "Gerando PIX..." : "Pagar com PIX (1 Mês)"}
                        </Button>
                      </div>
                    )}
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

      {isPixModalOpen && pixData && (
        <Dialog open={isPixModalOpen} onOpenChange={setIsPixModalOpen}>
            <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle>Pague com PIX</DialogTitle>
                    <DialogDescription>
                        Escaneie o QR code ou copie o código abaixo para pagar.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <img src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="PIX QR Code" className="w-64 h-64" />
                    <div className="mt-4 p-2 bg-gray-800 rounded-md w-full">
                        <p className="text-sm break-all">{pixData.qr_code}</p>
                    </div>
                    <Button
                        onClick={() => {
                            navigator.clipboard.writeText(pixData.qr_code);
                            alert("Código PIX copiado para a área de transferência!");
                        }}
                        className="mt-4 w-full"
                    >
                        Copiar Código PIX
                    </Button>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsPixModalOpen(false)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
