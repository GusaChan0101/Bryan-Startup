import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || !user.is_admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Admin Users API Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}