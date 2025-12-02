'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from 'lucide-react';

export default function CreateStudyPlanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: '',
    exam_date: '',
    daily_hours: '',
    difficulty_level: 'Médio',
    banca: '',
    escolaridade: 'Ensino Médio',
    finalidade: 'Concurso Público',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Você precisa estar logado para criar um plano de estudos.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/ai/create-study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Falha ao criar plano de estudos');
      }

      const newPlan = await res.json();
      router.push(`/main/study-plans`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <Wand2 className="h-12 w-12 mx-auto text-primary" />
            <CardTitle className="text-3xl font-bold mt-4">Criar Plano de Estudos</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Deixe nossa IA gerar um plano de estudos personalizado para você.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlan} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Matéria Principal *</Label>
                  <Input id="subject" value={formData.subject} onChange={handleInputChange} placeholder="Ex: Direito Constitucional" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banca">Banca Examinadora</Label>
                  <Input id="banca" value={formData.banca} onChange={handleInputChange} placeholder="Ex: FGV, CEBRASPE" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalidade">Objetivo</Label>
                <Input id="finalidade" value={formData.finalidade} onChange={handleInputChange} placeholder="Ex: Concurso PRF, OAB" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="escolaridade">Nível de Escolaridade</Label>
                  <select id="escolaridade" value={formData.escolaridade} onChange={handleInputChange} className="w-full h-10 px-3 bg-transparent border rounded-md">
                    <option>Ensino Médio</option>
                    <option>Ensino Superior</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">Nível de Dificuldade</Label>
                  <select id="difficulty_level" value={formData.difficulty_level} onChange={handleInputChange} className="w-full h-10 px-3 bg-transparent border rounded-md">
                    <option>Iniciante</option>
                    <option>Médio</option>
                    <option>Avançado</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="exam_date">Data da Prova</Label>
                  <Input id="exam_date" type="date" value={formData.exam_date} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_hours">Horas de Estudo por Dia</Label>
                  <Input id="daily_hours" type="number" value={formData.daily_hours} onChange={handleInputChange} placeholder="Ex: 4" />
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Gerar Plano de Estudos'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}