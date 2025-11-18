import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { planId } = await request.json();

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const group = await db.collection('groups').findOne({ id: id });
    if (!group) {
      return NextResponse.json({ message: 'Grupo não encontrado' }, { status: 404 });
    }

    if (!group.members.includes(user.id)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studyPlan = await db.collection('study_plans').findOne({ id: planId });
    if (!studyPlan) {
      return NextResponse.json({ message: 'Plano de estudos não encontrado' }, { status: 404 });
    }

    if (studyPlan.user_id !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await db.collection('study_plans').updateOne(
      { id: planId },
      { $addToSet: { groupIds: id } }
    );

    return NextResponse.json({ message: 'Plano compartilhado com sucesso' });

  } catch (error) {
    console.error('POST /api/groups/[id]/share Error:', error);
    return NextResponse.json({ message: 'Erro ao compartilhar plano' }, { status: 500 });
  }
}