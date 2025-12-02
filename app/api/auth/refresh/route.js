// app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken, generateTokens } from '@/lib/middleware/auth';

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token não fornecido' },
        { status: 401 }
      );
    }

    // 1. Verificar refresh token
    let decoded;
    try {
      decoded = verifyToken(refreshToken, true);
    } catch (error) {
      return NextResponse.json(
        { message: 'Refresh token inválido ou expirado' },
        { status: 401 }
      );
    }

    // 2. Buscar usuário e validar refresh token
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    const user = await db.collection('users').findOne(
      { id: decoded.sub },
      { projection: { password: 0 } }
    );

    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token inválido' },
        { status: 401 }
      );
    }

    // 3. Gerar novos tokens
    const tokens = generateTokens(user);

    // 4. Atualizar refresh token no banco
    await db.collection('users').updateOne(
      { id: user.id },
      { $set: { refreshToken: tokens.refreshToken } }
    );

    // 5. Retornar novos tokens
    return NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { message: 'Erro ao renovar token' },
      { status: 500 }
    );
  }
}