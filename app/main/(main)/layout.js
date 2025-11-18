'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';

import { Search, CircleUser } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MainLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        console.error(error);
        localStorage.removeItem('token');
        router.push('/');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  

    return (

      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-black text-white">

        <Sidebar onLogout={handleLogout} user={user} />

        <div className="flex flex-col">

          <header className="flex h-14 items-center gap-4 border-b border-white/10 bg-black px-4 lg:h-[60px] lg:px-6">

            <div className="w-full flex-1">

              <form>

                <div className="relative">

                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />

                  <Input

                    type="search"

                    placeholder="Buscar..."

                    className="w-full appearance-none bg-zinc-900 border-transparent focus:border-blue-600 pl-8 shadow-none md:w-2/3 lg:w-1/3 text-white"

                  />

                </div>

              </form>

            </div>

            <DropdownMenu>

              <DropdownMenuTrigger asChild>

                <Button variant="secondary" size="icon" className="rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">

                  <CircleUser className="h-5 w-5" />

                  <span className="sr-only">Alternar menu de usuário</span>

                </Button>

              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">

                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white">Configurações</DropdownMenuItem>

                <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white">Suporte</DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem onClick={handleLogout} className="focus:bg-zinc-800 focus:text-white">Sair</DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">

            {children}

          </main>

        </div>

      </div>

    );

  }

  