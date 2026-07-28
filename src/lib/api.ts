import { NextResponse } from "next/server";

export type ApiError = {
  error: string;
  details?: unknown;
  status: number;
};

export function apiError(message: string, status = 500, details?: unknown): NextResponse {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status });
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function unauthorized() {
  return apiError("Unauthorized", 401);
}

export function notFound(resource = "Resource") {
  return apiError(`${resource} not found`, 404);
}

export function badRequest(message: string, details?: unknown) {
  return apiError(message, 400, details);
}

export function conflict(message: string) {
  return apiError(message, 409);
}

export async function withErrorHandler(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    console.error("[API Error]", err);
    return apiError("Internal server error", 500);
  }
}
