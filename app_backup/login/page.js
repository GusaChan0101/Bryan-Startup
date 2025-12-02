'use client';

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../AuthContext'; // Importar o hook useAuth

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Usar o hook de autenticação

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Falha no login');
      }

      const { access_token } = await res.json();
      login(access_token); // Usar a função de login do contexto
      
      router.push('/main/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
           <Button asChild className="bg-blue-600 hover:bg-blue-700">
             <Link href="/login">Entrar</Link>
           </Button>
         </nav>
       </header>
      <main className="flex-1 flex items-center justify-center pt-20">
        <div className="w-full max-w-md space-y-8 p-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600/10 rounded-2xl">
                <GraduationCap className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Mindeiro</h1>
            <p className="mt-3 text-lg text-gray-400">
              Sua plataforma de estudos inteligente
            </p>
          </div>

          <Card className="border border-white/10 bg-zinc-900">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-white">Bem-vindo de volta</CardTitle>
              <CardDescription className="text-base text-gray-400">
                Entre com suas credenciais para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-zinc-800 border-white/20 text-white"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                      Senha
                    </Label>
                    <Link 
                      href="#" 
                      className="text-sm text-blue-400 hover:underline"
                    >
                      Esqueceu?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-zinc-800 border-white/20 text-white"
                    disabled={loading}
                  />
                </div>
                
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-400">Não tem uma conta? </span>
                <Link href="/register" className="font-semibold text-blue-400 hover:underline">
                  Cadastre-se gratuitamente
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500">
            Ao continuar, você concorda com nossos{' '}
            <Link href="#" className="underline hover:text-gray-300">
              Termos de Serviço
            </Link>
          </p>
        </div>
      </main>
      <footer className="py-10 text-center text-gray-400 border-t border-white/10">
        <p>© 2025 Mindeiro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}