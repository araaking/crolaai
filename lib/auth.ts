// lib/auth.ts
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User } from '@prisma/client';
import prisma from './prisma'; // Import prisma instance
import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const SALT_ROUNDS = 10; // Cost factor for hashing
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = '1d'; // Token expiration time (e.g., 1 day)

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

/**
 * Hashes a plain text password.
 * @param password - The plain text password.
 * @returns The hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password.
 * @param hashedPassword - The hashed password from the database.
 * @returns True if the password matches the hash, false otherwise.
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generates a JWT token for a user.
 * @param payload - The data to include in the token (e.g., { userId: string }).
 * @returns The generated JWT token.
 */
export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 * @param token - The JWT token string.
 * @returns The decoded payload (e.g., { userId: string, iat: number, exp: number }).
 */
export async function getUserIdFromToken(token: string): Promise<string | undefined> {
  try {
    if (!token) {
      console.error('No token provided');
      return undefined;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
    if (!decoded || !decoded.userId) {
      console.error('Invalid token payload');
      return undefined;
    }
    
    return decoded.userId;
  } catch (error) {
    console.error('Token verification failed:', error);
    return undefined;
  }
}

/**
 * Extracts the JWT token from the Authorization header of a NextRequest.
 * @param request - The NextRequest object.
 * @returns The token string or null if not found or invalid format.
 */
export const getTokenFromRequest = (request: NextRequest): string | null => {
    const authHeader = request.headers.get('authorization');
    // Check if header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return null;
    }
    // Return the token part after 'Bearer '
    return authHeader.substring(7);
};

/**
 * Retrieves the authenticated user based on the JWT in the request.
 * Returns null if token is missing, invalid, or user not found.
 * @param request - The NextRequest object.
 * @returns The User object or null.
 */
export const getAuthenticatedUser = async (request: NextRequest): Promise<User | null> => {
    const token = getTokenFromRequest(request);
    if (!token) {
        console.log('No token found in request');
        return null;
    }

    try {
        const userId = await getUserIdFromToken(token);
        console.log(`Token verified for userId: ${userId}`);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.log(`User not found for userId: ${userId}`);
            return null;
        }
        console.log(`Authenticated user found: ${user.email}`);
        // Exclude password before returning user object
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User; // Cast back to User type after omitting password
    } catch (error) {
        // Log specific error from verifyToken or prisma
        console.error("Authentication error:", error instanceof Error ? error.message : error);
        return null;
    }
};

interface JWTPayload {
  userId: string;
  email: string;
}

export function verifyAuth(request: NextRequest): JWTPayload | null {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

interface Credentials {
  email: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Credentials | undefined): Promise<NextAuthUser | null> {
        // Di sini kamu bisa implementasi validasi user
        // Untuk sementara kita return user dummy
        if (credentials?.email && credentials?.password) {
          return {
            id: "1",
            email: credentials.email,
            name: "Test User",
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: NextAuthUser | null }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};
