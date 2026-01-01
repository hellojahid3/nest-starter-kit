import { registerAs } from "@nestjs/config";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from "class-validator";

import validateConfig from "@/lib/validate-config";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

class EnvironmentVariablesValidator {
  @IsString()
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  APP_NAME: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  APP_URL: string;
}

export const appConfig = registerAs("app", () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    environment: config.NODE_ENV,
    port: config.PORT,
    name: config.APP_NAME,
    url: config.APP_URL,
  };
});
