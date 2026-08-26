import type { Request } from 'express';
import type { JwtPayload } from 'src/common/types/jwt-payload.type';

export type RequestWithUser = Request & {
  user: JwtPayload;
};
