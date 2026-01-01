import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { ResponseInterceptor } from "./lib/interceptors/response";
import { PrismaModule } from "./prisma/prisma.module";
import { appConfig } from "./app.config";
import { AppException } from "./app.exception";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: [".env"],
    }),
    PrismaModule,
    AppModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AppException,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
