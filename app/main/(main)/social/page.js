'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Loader2 } from 'lucide-react';

export default function SocialPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [following, setFollowing] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Você precisa estar logado para ver a comunidade.');
        setLoading(false);
        return;
      }

      try {
        // Fetch current user
        const meRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!meRes.ok) throw new Error('Falha ao buscar seu perfil');
        const meData = await meRes.json();
        setCurrentUser(meData);
        setFollowing(new Set(meData.following || []));

        // Fetch all users
        const usersRes = await fetch('/api/users');
        if (!usersRes.ok) throw new Error('Falha ao buscar usuários');
        const usersData = await usersRes.json();
        setUsers(usersData.filter(user => user.id !== meData.id)); // Exclude current user

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFollow = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Você precisa estar logado para seguir alguém.');
      return;
    }

    const isCurrentlyFollowing = following.has(userId);

    // Optimistic update
    const newFollowing = new Set(following);
    if (isCurrentlyFollowing) {
      newFollowing.delete(userId);
    } else {
      newFollowing.add(userId);
    }
    setFollowing(newFollowing);

    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          followers: isCurrentlyFollowing
            ? user.followers.filter(id => id !== currentUser.id)
            : [...user.followers, currentUser.id],
        };
      }
      return user;
    }));

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Falha ao seguir o usuário');
      }

    } catch (err) {
      console.error(err);
      // Revert the state if the API call fails
      setFollowing(prev => {
        const newSet = new Set(prev);
        if (newSet.has(userId)) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });
      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            followers: isCurrentlyFollowing
              ? [...user.followers, currentUser.id]
              : user.followers.filter(id => id !== currentUser.id),
          };
        }
        return user;
      }));
      setError('Ocorreu um erro. Tente novamente.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  return (
    <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-white">Comunidade</h1>
                <p className="text-gray-400">
                    Conecte-se com outros estudantes e concurseiros.
                </p>
            </div>

            <div className="mb-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Pesquisar usuários..."
                        className="pl-10 h-12 bg-zinc-900 border-white/20 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="text-center bg-zinc-900 border border-white/10 hover:border-blue-600/50 transition-colors">
                        <CardHeader>
                            <Avatar className="mx-auto h-24 w-24 mb-4 border-4 border-blue-600/20">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="bg-zinc-800 text-white">{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-white">{user.name}</CardTitle>
                            <CardDescription className="text-gray-400">{user.followers.length} seguidores</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button 
                                onClick={() => handleFollow(user.id)}
                                disabled={following.has(user.id)}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-gray-400"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                {following.has(user.id) ? 'Seguindo' : 'Seguir'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
}