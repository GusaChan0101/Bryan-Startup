'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Falha ao buscar usuários');
      }
      const data = await res.json();
      setUsers(data.map(u => ({ ...u, plan_renewal_date: u.plan_renewal_date ? new Date(u.plan_renewal_date).toISOString().split('T')[0] : '' })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSetAdmin = async (userId, isAdmin) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/users/${userId}/set-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !isAdmin }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlanChange = (userId, plan) => {
    setUsers(users.map(u => u._id === userId ? { ...u, plan } : u));
  };

  const handleRenewalDateChange = (userId, date) => {
    setUsers(users.map(u => u._id === userId ? { ...u, plan_renewal_date: date } : u));
  };

  const handleSavePlan = async (userId) => {
    try {
      const user = users.find(u => u._id === userId);
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/users/${userId}/set-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: user.plan, plan_renewal_date: user.plan_renewal_date }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Usuários</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Renovação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                  {user.is_admin ? 'Sim' : 'Não'}
                </Badge>
              </TableCell>
              <TableCell>
                <Select value={user.plan || 'Free'} onValueChange={(value) => handlePlanChange(user._id, value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Grátis</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={user.plan_renewal_date}
                  onChange={(e) => handleRenewalDateChange(user._id, e.target.value)}
                />
              </TableCell>
              <TableCell className="space-x-2">
                <Button onClick={() => handleSetAdmin(user._id, user.is_admin)}>
                  {user.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                </Button>
                <Button onClick={() => handleSavePlan(user._id)}>Salvar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}