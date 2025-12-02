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

    const studyPlans = await db.collection('study_plans').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: 'id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 1,
          id: 1,
          subject: 1,
          created_at: 1,
          'userInfo.name': 1,
          'userInfo.email': 1
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ]).toArray();

    return NextResponse.json(studyPlans);

  } catch (error) {
    console.error('Admin Study Plans API Error:', error);
    return NextResponse.json({ message: 'Erro ao buscar planos de estudo' }, { status: 500 });
  }
}

export async function DELETE(request) {
    try {
      const user = await getUserFromRequest(request);
  
      if (!user || !user.is_admin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const { id } = await request.json();
  
      if (!id) {
        return NextResponse.json({ message: 'ID do plano de estudo é obrigatório' }, { status: 400 });
      }
  
      const client = await clientPromise;
      const db = client.db(process.env.DB_NAME);
  
      const result = await db.collection('study_plans').deleteOne({ id: id });
  
      if (result.deletedCount === 0) {
        return NextResponse.json({ message: 'Plano de estudo não encontrado' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Plano de estudo excluído com sucesso' });
  
    } catch (error) {
      console.error('Admin Delete Study Plan API Error:', error);
      return NextResponse.json({ message: 'Erro ao excluir plano de estudo' }, { status: 500 });
    }
  }