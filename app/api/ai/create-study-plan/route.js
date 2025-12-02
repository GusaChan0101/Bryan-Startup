// app/api/ai/create-study-plan/route.js
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/middleware/auth';
import { createStudyPlanSchema, validateRequest } from '@/lib/validation/schemas';
import { studyPlanService } from '@/lib/services/study-plan.service';
import { rateLimiters, withRateLimit } from '@/lib/middleware/rate-limit';

export async function POST(request) {
  try {
    // 1. Autenticação
    const authResult = await getUserFromRequest(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // 2. Rate Limiting (10 planos por hora)
    const rateLimitResult = await withRateLimit(rateLimiters.createPlan)(request, user);
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    // 3. Validação dos dados
    const { data, error } = await validateRequest(createStudyPlanSchema)(request);
    
    if (error) {
      return NextResponse.json(error, { status: 400 });
    }

    // 4. Verificar limite do plano
    const canCreate = await studyPlanService.canCreatePlan(user.id, user.plan);
    
    if (!canCreate.allowed) {
      return NextResponse.json({
        message: `Você atingiu o limite de ${canCreate.limit} plano(s) do plano gratuito.`,
        upgrade: true,
        upgradeUrl: '/pricing',
        currentPlans: canCreate.current,
        limit: canCreate.limit
      }, { status: 403 });
    }

    // 5. Gerar plano de estudos
    const studyPlan = await studyPlanService.createStudyPlan(data, user.id);

    // 6. Adicionar headers de rate limit na resposta
    const headers = {
      ...rateLimitResult,
      'Content-Type': 'application/json'
    };

    return NextResponse.json({
      success: true,
      message: 'Plano de estudos criado com sucesso',
      plan: studyPlan
    }, { headers });

  } catch (error) {
    console.error('Create study plan error:', error);

    // Retornar erro apropriado
    if (error.message.includes('Nenhuma aula foi gerada')) {
      return NextResponse.json({
        message: 'Não foi possível gerar o plano de estudos. Tente novamente.',
        error: 'GENERATION_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Erro ao criar plano de estudos',
      error: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}