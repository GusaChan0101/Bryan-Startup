'use client';

import { useState } from 'react';
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Falha no cadastro');
      }

      const { access_token } = await res.json();
      localStorage.setItem('token', access_token);
      
      router.push('/main/dashboard');

    } catch (err) {
      setError(err.message);
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
        <div className="mx-auto grid w-[350px] gap-6 p-4">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-white">Mindeiro</h1>
            <p className="text-balance text-gray-400">
              Crie sua conta para começar a estudar
            </p>
          </div>
          <Card className="mx-auto max-w-sm border border-white/10 bg-zinc-900">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Cadastro</CardTitle>
              <CardDescription className="text-gray-400">
                Preencha os campos para criar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-300">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-800 border-white/20 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-800 border-white/20 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-gray-300">Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-800 border-white/20 text-white"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Criar Conta
                </Button>
                <div className="mt-4 text-center text-sm">
                  <span className="text-gray-400">Já tem uma conta?{" "}</span>
                  <Link href="/login" className="underline text-blue-400 hover:text-blue-500">
                    Fazer login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="py-10 text-center text-gray-400 border-t border-white/10">
        <p>© 2025 Mindeiro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}