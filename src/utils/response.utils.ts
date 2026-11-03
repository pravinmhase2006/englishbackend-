import { FastifyReply } from 'fastify';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export function sendSuccess<T>(
  reply: FastifyReply,
  data?: T,
  message?: string,
  statusCode = 200
): FastifyReply {
  return reply.status(statusCode).send({
    success: true,
    message,
    data,
  });
}

export function sendError(
  reply: FastifyReply,
  message = 'An unexpected error occurred',
  statusCode = 400,
  errors?: any
): FastifyReply {
  return reply.status(statusCode).send({
    success: false,
    message,
    errors,
  });
}
