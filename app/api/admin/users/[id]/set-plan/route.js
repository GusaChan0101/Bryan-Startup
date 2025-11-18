import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request, { params }) {
  try {
    const adminUser = await getUserFromRequest(request);

    if (!adminUser || !adminUser.is_admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { plan, plan_renewal_date } = await request.json();

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { plan, plan_renewal_date: plan_renewal_date ? new Date(plan_renewal_date) : null } }
    );

    return NextResponse.json({ message: 'User plan updated successfully' });
  } catch (error) {
    console.error('Set Plan API Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
