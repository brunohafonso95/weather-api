import { Response } from 'express';

import IDefaultResponse from '@src/interfaces/IDefaultResponse';
import ApiError, { IApiError } from '@src/util/errors/ApiError';

export default abstract class BaseController {
  protected sendErrorResponse(res: Response, error: IApiError): Response {
    return res.status(error.code).json(ApiError.format(error));
  }

  protected sendDefaulResponse<T>(
    res: Response,
    responseDetails: IDefaultResponse<T>,
  ): Response {
    return res.status(responseDetails.code).json(responseDetails.payload);
  }
}
