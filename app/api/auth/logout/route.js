// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest, blacklistToken, verifyToken } from '@/lib/middleware/auth';

export async function POST(request) {
  try {
    // 1. Obter usuário
    const result = await getUserFromRequest(request);
    
    if (result.error) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = result.user;
    const token = request.headers.get('authorization').split(' ')[1];

    // 2. Adicionar token à blacklist
    const decoded = verifyToken(token);
    await blacklistToken(token, decoded.exp);

    // 3. Remover refresh token do usuário
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    await db.collection('users').updateOne(
      { id: user.id },
      { $unset: { refreshToken: "" } }
    );

    return NextResponse.json({
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}