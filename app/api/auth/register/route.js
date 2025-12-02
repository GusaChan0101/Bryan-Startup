// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { registerSchema } from '@/lib/validation/schemas';
import { validateRequest } from '@/lib/validation/schemas';
import { generateTokens } from '@/lib/middleware/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'gustavo.simoncini5@gmail.com';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export async function POST(request) {
  try {
    // 1. Validar dados
    const { data, error } = await validateRequest(registerSchema)(request);
    
    if (error) {
      return NextResponse.json(error, { status: 400 });
    }

    const { email, password, name } = data;

    // 2. Conectar ao banco
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    // 3. Verificar se email já existe
    const existingUser = await usersCollection.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // 4. Hash da senha
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // 5. Criar usuário
    const newUser = {
      id: uuidv4(),
      email,
      name,
      password: hashedPassword,
      avatar: null,
      bio: null,
      is_admin: email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
      followers: [],
      following: [],
      created_at: new Date(),
      updated_at: new Date(),
      plan: 'Free',
      plan_renewal_date: null,
      emailVerified: false, // Para implementar verificação futura
    };

    await usersCollection.insertOne(newUser);

    // 6. Gerar tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    // 7. Salvar refresh token
    await usersCollection.updateOne(
      { id: newUser.id },
      { $set: { refreshToken } }
    );

    // 8. Remover senha da resposta
    const { password: _, ...userWithoutPassword } = newUser;

    // 9. Retornar resposta
    return NextResponse.json({
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: userWithoutPassword,
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}