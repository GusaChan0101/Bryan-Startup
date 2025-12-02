import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || !user.is_admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const usersCollection = db.collection('users');
    const studyPlansCollection = db.collection('study_plans');

    const totalUsers = await usersCollection.countDocuments();
    const proUsers = await usersCollection.countDocuments({ plan: 'Pro' });
    const freeUsers = await usersCollection.countDocuments({ plan: 'Free' });
    const totalPlans = await studyPlansCollection.countDocuments();

    const stats = {
      totalUsers,
      proUsers,
      freeUsers,
      totalPlans,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin Stats API Error:', error);
    return NextResponse.json({ message: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}