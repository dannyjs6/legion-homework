import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithUser } from 'src/common/types/request-with-user.type';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    return request.user;
  },
);
