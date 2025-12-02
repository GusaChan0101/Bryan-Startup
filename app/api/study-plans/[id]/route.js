// app/api/study-plans/[id]/route.js (atualizada)
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/middleware/auth';
import { studyPlanService } from '@/lib/services/study-plan.service';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'ID não fornecido' },
        { status: 400 }
      );
    }

    // Autenticação
    const authResult = await getUserFromRequest(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Buscar plano
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    const studyPlan = await db.collection('study_plans').findOne({ id });

    if (!studyPlan) {
      return NextResponse.json(
        { message: 'Plano de estudos não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    const hasAccess = await checkPlanAccess(studyPlan, user, db);
    
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Você não tem permissão para acessar este plano' },
        { status: 403 }
      );
    }

    // Adicionar estatísticas
    const stats = await studyPlanService.getPlanStats(id, user.id);

    return NextResponse.json({
      ...studyPlan,
      stats
    });

  } catch (error) {
    console.error('Get study plan error:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar plano de estudos' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;

    // Autenticação
    const authResult = await getUserFromRequest(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const updates = await request.json();

    // Buscar plano existente
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    const existingPlan = await db.collection('study_plans').findOne({ id });

    if (!existingPlan) {
      return NextResponse.json(
        { message: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    const hasAccess = await checkPlanAccess(existingPlan, user, db);
    
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Você não tem permissão para editar este plano' },
        { status: 403 }
      );
    }

    // Se está atualizando lições, validar
    if (updates.lessons) {
      const isValid = updates.lessons.every(lesson => 
        lesson.id && typeof lesson.completed === 'boolean'
      );

      if (!isValid) {
        return NextResponse.json(
          { message: 'Formato de aulas inválido' },
          { status: 400 }
        );
      }
    }

    // Atualizar plano
    const result = await db.collection('study_plans').findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...updates, 
          updated_at: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { message: 'Erro ao atualizar plano' },
        { status: 500 }
      );
    }

    // Adicionar estatísticas atualizadas
    const stats = await studyPlanService.getPlanStats(id, user.id);

    return NextResponse.json({
      ...result,
      stats
    });

  } catch (error) {
    console.error('Update study plan error:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar plano' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Autenticação
    const authResult = await getUserFromRequest(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Deletar plano (apenas se for dono)
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    const result = await db.collection('study_plans').deleteOne({
      id,
      user_id: user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Plano não encontrado ou você não tem permissão' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Plano deletado com sucesso',
      deleted: true
    });

  } catch (error) {
    console.error('Delete study plan error:', error);
    return NextResponse.json(
      { message: 'Erro ao deletar plano' },
      { status: 500 }
    );
  }
}

/**
 * Verifica se usuário tem acesso ao plano
 */
async function checkPlanAccess(plan, user, db) {
  // Dono tem acesso
  if (plan.user_id === user.id) {
    return true;
  }

  // Admin tem acesso
  if (user.is_admin) {
    return true;
  }

  // Verificar se plano está compartilhado em grupo do usuário
  if (plan.groupIds && plan.groupIds.length > 0) {
    const userGroups = await db.collection('groups')
      .find({ members: user.id })
      .toArray();
    
    const groupIds = userGroups.map(g => g.id);
    return plan.groupIds.some(gid => groupIds.includes(gid));
  }

  return false;
}