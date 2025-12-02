// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { loginSchema } from '@/lib/validation/schemas';
import { validateRequest } from '@/lib/validation/schemas';
import { generateTokens } from '@/lib/middleware/auth';

// Rate limiting será implementado via middleware
export async function POST(request) {
  try {
    // 1. Validar dados de entrada
    const { data, error } = await validateRequest(loginSchema)(request);
    
    if (error) {
      return NextResponse.json(error, { status: 400 });
    }

    const { email, password } = data;

    // 2. Buscar usuário
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });

    if (!user) {
      // Não revelar se email existe ou não (segurança)
      return NextResponse.json(
        { message: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // 3. Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Log de tentativa falhada (para monitoramento)
      await logFailedLogin(email, request);
      
      return NextResponse.json(
        { message: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // 4. Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // 5. Salvar refresh token no banco
    await usersCollection.updateOne(
      { id: user.id },
      { 
        $set: { 
          lastLogin: new Date(),
          refreshToken: refreshToken // Salvar para validação futura
        } 
      }
    );

    // 6. Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    // 7. Retornar resposta
    return NextResponse.json({
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutos em segundos
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Log de tentativas falhadas (para monitoramento de ataques)
 */
async function logFailedLogin(email, request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';

    await db.collection('failed_logins').insertOne({
      email,
      ip,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date()
    });

    // Criar índice TTL para limpar logs antigos (30 dias)
    await db.collection('failed_logins').createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 2592000 }
    );
  } catch (error) {
    console.error('Failed to log failed login:', error);
  }
}