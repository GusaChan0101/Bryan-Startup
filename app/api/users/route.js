import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();

    return NextResponse.json(users);

  } catch (error) {
    console.error('GET /api/users Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
