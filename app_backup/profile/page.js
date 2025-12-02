'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        const userData = await res.json();
        setUser(userData);
        setName(userData.name);
        setBio(userData.bio || '');
        setAvatar(userData.avatar || '');
      } catch (error) {
        console.error(error);
        localStorage.removeItem('token');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio, avatar }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Falha ao atualizar perfil');
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      alert('Perfil atualizado com sucesso!');

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="w-full flex-1">
          <h1 className="text-lg font-semibold">Meu Perfil</h1>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="grid gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
                <Input id="avatar" placeholder="URL do Avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Fale um pouco sobre você" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}