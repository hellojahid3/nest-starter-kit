import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { SET_RESPONSE_MESSAGE_METADATA } from "@/lib/decorators/set-response-message";
import { SKIP_RESPONSE_INTERCEPTOR_METADATA } from "@/lib/decorators/skip-response-interceptor";
import { TResponse } from "@/types/response";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  TResponse<T> | T
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<TResponse<T> | T> {
    const shouldSkip = this.reflector.get<boolean>(
      SKIP_RESPONSE_INTERCEPTOR_METADATA,
      context.getHandler()
    );

    if (shouldSkip) {
      return next.handle();
    }

    return next
      .handle()
      .pipe(map((res: T) => this.responseHandler<T>(res, context)));
  }

  responseHandler<T>(res: T, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = response.statusCode;
    const message =
      this.reflector.get<string>(
        SET_RESPONSE_MESSAGE_METADATA,
        context.getHandler()
      ) || undefined;

    return {
      success: true,
      statusCode: status,
      path: request.url,
      ...(message ? { message } : {}),
      data: res,
      timestamp: new Date().toISOString(),
    };
  }
}
