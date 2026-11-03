import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/response.utils';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUserPayload;
    user: AuthUserPayload;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(reply, 'Authorization token is required (Format: Bearer <token>)', 401);
      return;
    }

    const payload = await request.jwtVerify<AuthUserPayload>();
    request.user = payload;
  } catch (err: any) {
    sendError(reply, 'Invalid or expired token', 401, err.message);
  }
}
