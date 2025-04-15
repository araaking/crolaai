// lib/utils.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes
 * @param inputs - The classes to be merged
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a standardized JSON error response.
 * @param message - The error message.
 * @param status - The HTTP status code.
 * @returns A NextResponse object with the error details.
 */
export const errorResponse = (message: string, status: number): NextResponse => {
  return NextResponse.json({ error: message }, { status });
};

/**
 * Handles Zod validation errors and returns a standardized error response.
 * Formats the error messages for better client-side handling.
 * @param error - The ZodError object.
 * @returns A NextResponse object with validation error details.
 */
export const handleZodError = (error: ZodError): NextResponse => {
    // Map Zod errors to a more client-friendly format
    const errors = error.errors.map(e => ({
        field: e.path.join('.') || 'general', // Assign a field name, use 'general' if path is empty
        message: e.message
    }));

    console.error("Validation Error:", JSON.stringify(errors, null, 2));

    // Return a 400 Bad Request response with structured error details
    return NextResponse.json(
        {
            error: 'Validation failed',
            details: errors
        },
        { status: 400 }
    );
};

/**
 * Simple utility to simulate delay (useful for testing loading states).
 * @param ms - Milliseconds to wait.
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
