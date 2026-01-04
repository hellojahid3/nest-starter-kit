import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import { ApiModule } from "./api/api.module";
import { HealthModule } from "./api/health/health.module";
import { cacheConfig } from "./cache/cache.config";
import { CacheConfigService } from "./cache/cache.service";
import { getLoggerConfig } from "./logger/logger.config";
import { MailModule } from "./mail/mail.module";
import { PrismaModule } from "./prisma/prisma.module";
import { appConfig } from "./app.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: [".env"],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule.forFeature(cacheConfig)],
      useClass: CacheConfigService,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const environment =
          configService.get<string>("NODE_ENV") ?? "development";
        const logLevel = configService.get<string>("LOG_LEVEL");

        return getLoggerConfig(environment, logLevel);
      },
    }),
    PrismaModule,
    MailModule,
    ApiModule,
    HealthModule,
  ],
  providers: [],
})
export class AppModule {}
