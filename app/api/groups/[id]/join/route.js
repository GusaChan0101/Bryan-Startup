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

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const group = await db.collection('groups').findOne({ id: id });
    
    if (!group) {
      return NextResponse.json({ message: 'Grupo não encontrado' }, { status: 404 });
    }

    const isMember = group.members.includes(user.id);

    if (isMember) {
      // Sair do grupo
      await db.collection('groups').updateOne(
        { id: id },
        { $pull: { members: user.id } }
      );
      return NextResponse.json({ message: 'Você saiu do grupo', joined: false });
    } else {
      // Entrar no grupo
      await db.collection('groups').updateOne(
        { id: id },
        { $addToSet: { members: user.id } }
      );
      return NextResponse.json({ message: 'Você entrou no grupo', joined: true });
    }

  } catch (error) {
    console.error('POST /api/groups/[id]/join Error:', error);
    return NextResponse.json({ message: 'Erro ao processar requisição' }, { status: 500 });
  }
}