import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import { ApiModule } from "./api/api.module";
import { HealthModule } from "./api/health/health.module";
import { getLoggerConfig } from "./logger/logger.config";
import { PrismaModule } from "./prisma/prisma.module";
import { appConfig } from "./app.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: [".env"],
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
    ApiModule,
    HealthModule,
  ],
  providers: [],
})
export class AppModule {}
