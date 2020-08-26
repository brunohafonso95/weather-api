import httpStatus from 'http-status-codes';

export interface IApiError {
  code: number;
  message: string;
  description?: string;
  codeAsString?: string;
  documentation?: string;
}

export interface IApiErrorResponse extends Omit<IApiError, 'codeAsString'> {
  error: string;
}

export default class ApiError {
  public static format(error: IApiError): IApiErrorResponse {
    return {
      ...{
        message: error.message,
        code: error.code,
        error: error.codeAsString
          ? error.codeAsString
          : httpStatus.getStatusText(error.code),
      },
      ...(error.documentation && { documentation: error.documentation }),
      ...(error.description && { description: error.description }),
    };
  }
}
