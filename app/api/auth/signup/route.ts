// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { errorResponse, handleZodError } from '@/lib/utils';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export async function POST(request: NextRequest) {
  console.log('POST /api/auth/signup initiated');
  try {
    // 1. Parse request body
    let body;
    try {
        body = await request.json();
        console.log('Request body parsed:', body);
    } catch (jsonError) {
        console.error('Error parsing JSON body:', jsonError);
        return errorResponse('Invalid JSON format in request body', 400);
    }

    // 2. Validate request body using Zod
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.flatten());
      return handleZodError(validationResult.error);
    }
    const { email, password } = validationResult.data;
    console.log(`Validation successful for email: ${email}`);

    // 3. Check if user already exists (case-insensitive email check is often preferred)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // Store and check emails in lowercase
    });

    if (existingUser) {
      console.log(`Conflict: User with email ${email} already exists.`);
      return errorResponse('User with this email already exists', 409); // 409 Conflict
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully.');

    // 5. Create user in database
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(), // Store email in lowercase
        password: hashedPassword,
      },
    });
    console.log(`User created successfully with ID: ${newUser.id}`);

    // 6. Return success response (exclude password hash)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ message: 'User created successfully', user: userWithoutPassword }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("Signup Error:", error);

    // Handle specific Prisma errors (like unique constraint violation if the check above failed)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
       if (error.code === 'P2002') {
           // This should ideally be caught by the findUnique check, but acts as a safeguard
           console.error('Prisma Error P2002: Unique constraint failed.');
           return errorResponse('User with this email already exists.', 409);
       }
       // Log other potential Prisma errors
       console.error(`Prisma Error ${error.code}: ${error.message}`);
       return errorResponse('Database error during signup', 500);
    }

    // Handle potential Zod errors if safeParse somehow throws (unlikely)
    if (error instanceof ZodError) {
        console.error('Unexpected Zod error:', error.flatten());
        return handleZodError(error); // Use the handler
    }

    // Handle generic errors
    return errorResponse('An unexpected error occurred during signup', 500);
  }
}
