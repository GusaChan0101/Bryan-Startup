import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, subject, isPrivate } = await request.json();

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const newGroup = {
      id: uuidv4(),
      name,
      description,
      subject,
      isPrivate,
      creator_id: user.id,
      members: [user.id],
      created_at: new Date(),
    };

    await db.collection('groups').insertOne(newGroup);

    return NextResponse.json(newGroup, { status: 201 });

  } catch (error) {
    console.error('POST /api/groups Error:', error);
    return NextResponse.json({ message: 'Erro ao criar grupo' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    const groups = await db.collection('groups').find({}).toArray();

    return NextResponse.json(groups);

  } catch (error) {
    console.error('GET /api/groups Error:', error);
    return NextResponse.json({ message: 'Erro ao buscar grupos' }, { status: 500 });
  }
}