'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Book, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart2 },
    { href: '/admin/users', label: 'Usuários', icon: Users },
    { href: '/admin/study-plans', label: 'Planos de Estudo', icon: Book },
  ];

  return (
    <div className="flex min-h-screen w-full">
      <aside className="w-64 flex-shrink-0 border-r bg-gray-100 dark:bg-gray-900 p-4">
        <div className="flex items-center h-14 mb-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
            <Home className="h-6 w-6" />
            <span>Admin</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800',
                {
                  'bg-gray-200 dark:bg-gray-800 text-black dark:text-white': pathname === item.href,
                }
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
    </div>
  );
}