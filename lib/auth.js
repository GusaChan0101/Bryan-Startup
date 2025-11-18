import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

export async function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ id: decoded.sub }, { projection: { password: 0 } });

    return user;
  } catch (error) {
    return null;
  }
}