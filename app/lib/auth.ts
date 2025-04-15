import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

interface AuthPayload extends JwtPayload {
  userId: string;
  email: string;
}

export function verifyAuth(req: NextRequest): AuthPayload | null {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return null;
  }

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
} 