import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = params; // ID do usuário a ser seguido

    if (decoded.sub === id) {
      return NextResponse.json({ message: 'Você não pode seguir a si mesmo' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const currentUser = await db.collection('users').findOne({ id: decoded.sub });
    const targetUser = await db.collection('users').findOne({ id: id });

    if (!targetUser) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    const isFollowing = currentUser.following?.includes(id) || false;

    if (isFollowing) {
      // Deixar de seguir
      await db.collection('users').updateOne(
        { id: decoded.sub },
        { $pull: { following: id } }
      );
      await db.collection('users').updateOne(
        { id: id },
        { $pull: { followers: decoded.sub } }
      );
      return NextResponse.json({ message: 'Você deixou de seguir', following: false });
    } else {
      // Seguir
      await db.collection('users').updateOne(
        { id: decoded.sub },
        { $addToSet: { following: id } }
      );
      await db.collection('users').updateOne(
        { id: id },
        { $addToSet: { followers: decoded.sub } }
      );
      return NextResponse.json({ message: 'Você começou a seguir', following: true });
    }

  } catch (error) {
    console.error('POST /api/users/[id]/follow Error:', error);
    return NextResponse.json({ message: 'Erro ao processar requisição' }, { status: 500 });
  }
}