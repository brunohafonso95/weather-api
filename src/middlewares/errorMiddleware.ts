import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';

import Logger from '@src/Logger';
import { CUSTOM_VALIDATION } from '@src/models/User';
import ApiError from '@src/util/errors/ApiError';

export interface HTTPError extends Error {
  status?: number;
}

function handleClientErrors(
  error: mongoose.Error.ValidationError,
): { code: number; error: string } {
  const duplicatedKindErrors = Object.values(error.errors).filter(
    err => err.kind === CUSTOM_VALIDATION.DUPLICATED,
  );

  if (duplicatedKindErrors.length) {
    return {
      code: httpStatus.CONFLICT,
      error: error.message,
    };
  }

  return {
    code: httpStatus.BAD_REQUEST,
    error: error.message,
  };
}

// eslint-disable-next-line max-params
export default function (
  error: mongoose.Error.ValidationError | HTTPError,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const { code, error: err } = handleClientErrors(error);

      res.status(code).json(
        ApiError.format({
          code,
          message: err,
        }),
      );

      return;
    }

    Logger.error(error);
    const errorCode = error.status || httpStatus.INTERNAL_SERVER_ERROR;
    res.status(errorCode).json(
      ApiError.format({
        code: errorCode,
        message: error.message || 'Something went wrong',
      }),
    );
  }

  next();
}
