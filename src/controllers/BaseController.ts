import { Response } from 'express';
import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';

import Logger from '@src/Logger';
import { CUSTOM_VALIDATION } from '@src/models/User';
import ApiError, { IApiError } from '@src/util/errors/api-error';

export default abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: Error | mongoose.Error.ValidationError,
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const { code, error: err } = this.handleClientErrors(error);
      res.status(code).json(
        ApiError.format({
          code,
          message: err,
        }),
      );

      return;
    }

    Logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
      ApiError.format({
        code: httpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }),
    );
  }

  protected sendErrorResponse(res: Response, error: IApiError): Response {
    return res.status(error.code).json(ApiError.format(error));
  }

  private handleClientErrors(
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
      code: httpStatus.UNPROCESSABLE_ENTITY,
      error: error.message,
    };
  }
}
