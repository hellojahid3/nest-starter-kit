import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnprocessableEntityException,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

import { Request } from "./types/request";

@Catch()
export class AppException implements ExceptionFilter {
  private readonly logger = new Logger(AppException.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let exceptionResponse: string | object =
      "Something went wrong, please try again later";

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();

      if (exception instanceof UnprocessableEntityException) {
        exceptionResponse = exception.getResponse();
      } else {
        exceptionResponse =
          (exception.getResponse() as HttpException).message ||
          exception.message;
      }
    } else {
      const error = exception as Error;
      this.logger.error(error.message, error?.stack);
    }

    const res = {
      success: false,
      statusCode: httpStatus,
      path: request.url,
      message: exceptionResponse,
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), res, HttpStatus.OK);
  }
}
