import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const userGroups = await db.collection('groups').find({ members: user.id }).toArray();
    const groupIds = userGroups.map(group => group.id);

    const study_plans = await db.collection('study_plans').find({
      $or: [
        { user_id: user.id },
        { groupIds: { $in: groupIds } }
      ]
    }).toArray();

    return NextResponse.json(study_plans);
  } catch (error) {
    console.error('Get Study Plans API Error:', error);
    return NextResponse.json({ message: 'Erro ao buscar cronogramas', error: error.message }, { status: 500 });
  }
}