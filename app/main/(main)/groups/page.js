'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Search, UserPlus, UserMinus, Lock, Globe } from 'lucide-react';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPlans, setUserPlans] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    isPrivate: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch current user
      const userRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setCurrentUser(userData);

      // Fetch groups
      const groupsRes = await fetch('/api/groups', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const groupsData = await groupsRes.json();
      setGroups(groupsData);

      // Fetch user's plans
      const plansRes = await fetch('/api/study-plans', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const plansData = await plansRes.json();
      setUserPlans(plansData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setFormData({ name: '', description: '', subject: '', isPrivate: false });
        fetchData(); // Reload groups
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleShare = (groupId) => {
    setSelectedGroupId(groupId);
    setIsShareDialogOpen(true);
  };

  const handleSharePlan = async (planId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      if (res.ok) {
        setIsShareDialogOpen(false);
      }
    } catch (error) {
      console.error('Error sharing plan:', error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        fetchData(); // Reload groups
      }
    } catch (error) {
      console.error('Error joining/leaving group:', error);
    }
  };

  const filteredGroups = Array.isArray(groups) ? groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const myGroups = filteredGroups.filter(g => g.members.includes(currentUser?.id));
  const otherGroups = filteredGroups.filter(g => !g.members.includes(currentUser?.id));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Grupos de Estudo</h1>
          <p className="text-gray-400 mt-1">
            Participe ou crie grupos para estudar em comunidade
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5" />
              Criar Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
              <DialogDescription className="text-gray-400">
                Crie um grupo de estudos para se conectar com outros estudantes
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Grupo *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Preparatórios FGV 2025"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-800 border-white/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Descreva o objetivo do grupo"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-zinc-800 border-white/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Matéria/Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Direito Constitucional"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="bg-zinc-800 border-white/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                  className="w-4 h-4 accent-blue-600"
                />
                <Label htmlFor="isPrivate" className="cursor-pointer text-gray-300">
                  Grupo Privado (apenas por convite)
                </Label>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Criar Grupo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Compartilhar Plano de Estudos</DialogTitle>
            <DialogDescription className="text-gray-400">
              Selecione um de seus planos de estudos para compartilhar com o grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {userPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 border border-white/10 rounded-md bg-zinc-800">
                <span className="text-gray-200">{plan.subject}</span>
                <Button onClick={() => handleSharePlan(plan.id)} className="bg-blue-600 hover:bg-blue-700">
                  Compartilhar
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar grupos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-zinc-900 border-white/20 text-white"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-900 border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{myGroups.length}</div>
              <div className="text-sm text-gray-400 mt-1">Meus Grupos</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{groups.length}</div>
              <div className="text-sm text-gray-400 mt-1">Total de Grupos</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {Array.isArray(groups) ? groups.reduce((acc, g) => acc + g.memberCount, 0) : 0}
              </div>
              <div className="text-sm text-gray-400 mt-1">Membros Totais</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meus Grupos */}
      {myGroups.length > 0 && (
        <Card className="bg-zinc-900 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Meus Grupos ({myGroups.length})</CardTitle>
            <CardDescription className="text-gray-400">Grupos que você participa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  isMember={true}
                  onJoin={() => handleJoinGroup(group.id)}
                  onShare={() => handleShare(group.id)}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Descobrir Grupos */}
      <Card className="bg-zinc-900 border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Descobrir Grupos ({otherGroups.length})</CardTitle>
          <CardDescription className="text-gray-400">Encontre novos grupos para participar</CardDescription>
        </CardHeader>
        <CardContent>
          {otherGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm 
                  ? 'Nenhum grupo encontrado' 
                  : 'Você já participa de todos os grupos disponíveis'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherGroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  isMember={false}
                  onJoin={() => handleJoinGroup(group.id)}
                  onShare={() => handleShare(group.id)}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Group Card Component
function GroupCard({ group, isMember, onJoin, onShare, currentUser }) {
  const isCreator = group.creator_id === currentUser?.id;

  return (
    <Card className="bg-zinc-900 border border-white/10 hover:border-blue-600/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg line-clamp-1 text-white">{group.name}</CardTitle>
              {group.isPrivate && <Lock className="h-4 w-4 text-gray-400" />}
              {!group.isPrivate && <Globe className="h-4 w-4 text-gray-400" />}
            </div>
            {group.subject && (
              <div className="inline-block px-2 py-1 bg-blue-600/10 text-blue-400 text-xs rounded-full mb-2">
                {group.subject}
              </div>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2 text-gray-400">
          {group.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Members */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {group.memberDetails?.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="border-2 border-black h-8 w-8">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs bg-zinc-700 text-white">
                    {member.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-gray-400">
              {group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'}
            </span>
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-2">
            {isCreator ? (
              <Button variant="outline" className="w-full border-white/20" disabled>
                <Users className="h-4 w-4 mr-2" />
                Você é o criador
              </Button>
            ) : (
              <Button
                className="w-full gap-2"
                variant={isMember ? "outline" : "default"}
                onClick={onJoin}
                {...(isMember ? {className: "bg-transparent border-white/20 hover:bg-white/10 w-full gap-2"} : {className: "bg-blue-600 hover:bg-blue-700 w-full gap-2"})}
              >
                {isMember ? (
                  <>
                    <UserMinus className="h-4 w-4" />
                    Sair do Grupo
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Entrar no Grupo
                  </>
                )}
              </Button>
            )}
            {isMember && (
              <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" onClick={onShare}>
                <Plus className="h-4 w-4" />
                Compartilhar Plano
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}