import { Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

import Logger from '@src/Logger';
import { CUSTOM_VALIDATION } from '@src/models/User';

export default abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: Error | mongoose.Error.ValidationError,
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const { code, error: err } = this.handleClientErrors(error);
      res.status(code).json({
        code,
        error: err,
      });

      return;
    }

    Logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      code: httpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
    });
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
