'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Book, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    freeUsers: 0,
    totalPlans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Falha ao buscar estatísticas');
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total de Usuários', value: stats.totalUsers, icon: Users, loading },
    { title: 'Usuários Pro', value: stats.proUsers, icon: Users, loading, color: 'text-blue-500' },
    { title: 'Usuários Gratuitos', value: stats.freeUsers, icon: Users, loading, color: 'text-green-500' },
    { title: 'Planos Criados', value: stats.totalPlans, icon: Book, loading },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {error && <div className="mb-4 text-red-500">Erro: {error}</div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 text-muted-foreground ${card.color || ''}`} />
            </CardHeader>
            <CardContent>
              {card.loading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Aqui você pode adicionar gráficos no futuro */}
    </div>
  );
}