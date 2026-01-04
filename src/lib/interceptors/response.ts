import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { SET_RESPONSE_MESSAGE_METADATA } from "@/lib/decorators/set-response-message";
import { TResponse } from "@/types/response";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  TResponse<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<TResponse<T>> {
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
