import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import { type NestExpressApplication } from "@nestjs/platform-express";
import { useContainer } from "class-validator";
import cookieParser from "cookie-parser";
import { Logger } from "nestjs-pino";

import { ResponseInterceptor } from "./lib/interceptors/response";
import validationOptions from "./lib/validation-options";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });

  const logger = app.get(Logger);

  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
    fallback: true,
  });

  const configService = app.get<ConfigService>(ConfigService);
  const appPort = configService.get<number>("PORT") || 8000;
  const corsOrigins = configService.getOrThrow<string>("CORS_ALLOWED_ORIGINS");

  app.enableCors({
    origin: corsOrigins ? corsOrigins.split(",") : "*",
    credentials: true,
  });
  app.set("trust proxy", true);
  app.use(cookieParser());
  app.useLogger(logger);
  app.enableShutdownHooks();
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(app.get(Reflector))
  );

  await app.listen(appPort, "0.0.0.0", async () => {
    const url = await app.getUrl();
    logger.log(`URL -> ${url}`);
  });
}

bootstrap();
