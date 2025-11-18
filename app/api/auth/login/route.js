import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'Email ou senha incorretos' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Email ou senha incorretos' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { sub: userWithoutPassword.id, email: userWithoutPassword.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
