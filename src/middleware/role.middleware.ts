import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/response.utils';
import { UserRole } from '../constants/app_constants';

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      sendError(reply, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(request.user.role as UserRole)) {
      sendError(reply, 'You do not have permission to perform this action', 403);
      return;
    }
  };
}
