// app/api/study-plans/[id]/lessons/[lessonId]/complete/route.js
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/middleware/auth';
import { studyPlanService } from '@/lib/services/study-plan.service';

export async function POST(request, { params }) {
  try {
    const { id, lessonId } = params;

    // Autenticação
    const authResult = await getUserFromRequest(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const { completed } = await request.json();

    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { message: 'Campo "completed" deve ser booleano' },
        { status: 400 }
      );
    }

    // Atualizar progresso
    const success = await studyPlanService.updateLessonProgress(
      id,
      lessonId,
      completed,
      user.id
    );

    if (!success) {
      return NextResponse.json(
        { message: 'Aula não encontrada ou sem permissão' },
        { status: 404 }
      );
    }

    // Obter estatísticas atualizadas
    const stats = await studyPlanService.getPlanStats(id, user.id);

    return NextResponse.json({
      message: completed ? 'Aula marcada como concluída' : 'Aula desmarcada',
      stats
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar aula' },
      { status: 500 }
    );
  }
}