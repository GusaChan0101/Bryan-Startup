import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ message: 'ID não fornecido' }, { status: 400 });
    }

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    // Buscar o plano específico por ID
    const study_plan = await db.collection('study_plans').findOne({ id: id });

    if (!study_plan) {
      return NextResponse.json({ message: 'Plano de estudos não encontrado' }, { status: 404 });
    }

    if (study_plan.user_id !== user.id) {
      if (!study_plan.groupIds || study_plan.groupIds.length === 0) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      const userGroups = await db.collection('groups').find({ members: user.id }).toArray();
      const groupIds = userGroups.map(group => group.id);

      const hasAccess = study_plan.groupIds.some(groupId => groupIds.includes(groupId));

      if (!hasAccess) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(study_plan);

  } catch (error) {
    console.error('Error fetching study plan:', error);
    return NextResponse.json({ 
      message: 'Erro ao buscar plano de estudos', 
      error: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID não fornecido' }, { status: 400 });
    }

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const existing_plan = await db.collection('study_plans').findOne({ id: id });

    if (!existing_plan) {
      return NextResponse.json({ message: 'Plano de estudos não encontrado' }, { status: 404 });
    }

    if (existing_plan.user_id !== user.id) {
      if (!existing_plan.groupIds || existing_plan.groupIds.length === 0) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      const userGroups = await db.collection('groups').find({ members: user.id }).toArray();
      const groupIds = userGroups.map(group => group.id);

      const hasAccess = existing_plan.groupIds.some(groupId => groupIds.includes(groupId));

      if (!hasAccess) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }
    
    // Atualizar o plano
    const result = await db.collection('study_plans').findOneAndUpdate(
      { id: id }, 
      { $set: { ...updates, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    console.log('findOneAndUpdate result:', result);

    if (!result.value) {
      return NextResponse.json({ message: 'Plano de estudos não encontrado ou não autorizado' }, { status: 404 });
    }

    return NextResponse.json(result.value);

    if (!result.value) {
      return NextResponse.json({ message: 'Plano de estudos não encontrado ou não autorizado' }, { status: 404 });
    }

    return NextResponse.json(result.value);

  } catch (error) {
    console.error('Error updating study plan:', error);
    return NextResponse.json({ 
      message: 'Erro ao atualizar plano de estudos', 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ message: 'ID não fornecido' }, { status: 400 });
    }

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    // Deletar o plano
    const result = await db.collection('study_plans').deleteOne({ id: id, user_id: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Plano de estudos não encontrado ou não autorizado' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Plano de estudos deletado com sucesso',
      deleted: true 
    });

  } catch (error) {
    console.error('Error deleting study plan:', error);
    return NextResponse.json({ 
      message: 'Erro ao deletar plano de estudos', 
      error: error.message 
    }, { status: 500 });
  }
}