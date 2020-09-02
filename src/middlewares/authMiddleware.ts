import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status-codes';

import AuthService from '@src/services/AuthService';
import ApiError from '@src/util/errors/ApiError';

export default function (
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction,
): void {
  const token = req.headers?.['x-access-token'];
  if (!token) {
    res.status?.(httpStatus.UNAUTHORIZED).json(
      ApiError.format({
        code: httpStatus.UNAUTHORIZED,
        message: 'jwt token not provided',
      }),
    );
    return;
  }

  try {
    const decoded = AuthService.decodeToken(token as string);
    req.decoded = decoded;
    next();
  } catch (error) {
    res.status?.(httpStatus.UNAUTHORIZED).json(
      ApiError.format({
        code: httpStatus.UNAUTHORIZED,
        message: error.message,
      }),
    );
  }
}
