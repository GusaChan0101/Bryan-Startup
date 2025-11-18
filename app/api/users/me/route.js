import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token não fornecido ou mal formatado' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    const { name, bio, avatar } = await request.json();

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    const result = await usersCollection.findOneAndUpdate(
      { id: decoded.sub },
      { $set: { name, bio, avatar } },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result.value) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.value);

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Token inválido ou expirado' }, { status: 401 });
    }
    console.error('PUT /api/users/me Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
