import type { Request } from 'express';
import type { JwtPayload } from 'src/features/auth/types/jwt-payload.type';

export type RequestWithUser = Request & {
  user: JwtPayload;
};
