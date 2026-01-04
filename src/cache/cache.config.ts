import { registerAs } from "@nestjs/config";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

import validateConfig from "@/lib/validate-config";

class EnvironmentVariablesValidator {
  @IsString()
  REDIS_HOST: string;

  @IsInt()
  @Min(0)
  REDIS_PORT: number;

  @IsOptional()
  @IsString()
  REDIS_USERNAME?: string;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;
}

export const cacheConfig = registerAs("cache", () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    username: config.REDIS_USERNAME,
    password: config.REDIS_PASSWORD,
    cacheTtl: 3600000, // 1 Hour
  };
});
