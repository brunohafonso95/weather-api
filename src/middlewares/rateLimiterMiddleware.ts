import { Request, Response } from 'express';
import rateLimiter, { RateLimit } from 'express-rate-limit';
import httpStatus from 'http-status-codes';

import ApiError from '@src/util/errors/ApiError';

export default function ({ windowMs, max }: rateLimiter.Options): RateLimit {
  return rateLimiter({
    windowMs: windowMs || 1 * 60 * 1000,
    max: max || 10,
    keyGenerator(req: Request): string {
      return req.ip;
    },
    handler(_req: Request, res: Response) {
      res.status(httpStatus.TOO_MANY_REQUESTS).json(
        ApiError.format({
          code: httpStatus.TOO_MANY_REQUESTS,
          message: 'you reach the limit of requests for this resource',
        }),
      );
    },
  });
}
