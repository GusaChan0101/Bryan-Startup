import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAIL = 'gustavo.simoncini5@gmail.com';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Email já cadastrado' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
      plan: 'Free',
      plan_renewal_date: null,
    };

    await usersCollection.insertOne(newUser);

    const { password: _, ...userWithoutPassword } = newUser;

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
    console.error('Register API Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
