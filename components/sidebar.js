'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Book, Users, MessageSquare, User, Crown, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Sidebar({ onLogout, user }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/main/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/main/study-plans', icon: Book, label: 'Planos de Estudo' },
    { href: '/main/social', icon: Users, label: 'Social' },
    { href: '/main/groups', icon: MessageSquare, label: 'Grupos' },
    { href: '/main/profile', icon: User, label: 'Meu Perfil' },
  ];

  if (user?.is_admin) {
    navItems.push({ href: '/admin', icon: Crown, label: 'Admin' });
  }

  return (
    <div className="hidden border-r border-white/10 bg-black md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-white/10 px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <div className="p-2 bg-blue-600/10 rounded-lg">
              <Book className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-lg">Mindeiro</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-3 py-2">
          <Card className="border border-white/10 bg-zinc-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-blue-600/10 text-blue-500 font-semibold">
                    {user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3">
          <nav className="grid items-start gap-2 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:bg-zinc-800 ${
                    isActive 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Upgrade Card */}
        <div className="mt-auto p-4">
          <Card className="border border-white/10 bg-zinc-900">
            <CardHeader className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Crown className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-base text-white">Upgrade para Pro</CardTitle>
              </div>
              <CardDescription className="text-xs text-gray-400">
                Desbloqueie recursos premium e suporte prioritário
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button size="sm" className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                <Zap className="h-4 w-4" />
                Fazer Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}