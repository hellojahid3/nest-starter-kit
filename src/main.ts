import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { useContainer } from "class-validator";
import cookieParser from "cookie-parser";

import validationOptions from "./lib/validation-options";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: false,
  });

  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
    fallback: true,
  });

  const logger = app.get(Logger);

  app.enableCors();
  app.use(cookieParser());
  app.useLogger(logger);
  app.enableShutdownHooks();
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 8000, "0.0.0.0", async () => {
    const url = await app.getUrl();
    logger.log(`Application is running on: ${url}`);
  });
}

bootstrap();
