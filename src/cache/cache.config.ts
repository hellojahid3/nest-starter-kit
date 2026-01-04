import { registerAs } from "@nestjs/config";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

import validateConfig from "@/lib/validate-config";
import { CacheDriver } from "./cache.enum";

class EnvironmentVariablesValidator {
  @IsString()
  @IsEnum(CacheDriver)
  CACHE_DRIVER: CacheDriver;

  @IsString()
  CACHE_STORAGE_URL: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  CACHE_TTL: number;
}

export const cacheConfig = registerAs("cache", () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  const workingDirectory = process.env.PWD || process.cwd();
  let cacheStorageUrl = `file://${workingDirectory}/.cache.db`;

  switch (config.CACHE_DRIVER) {
    case CacheDriver.Redis:
      cacheStorageUrl = config.CACHE_STORAGE_URL ?? "redis://localhost:6379";
      break;
    case CacheDriver.Sqlite:
      cacheStorageUrl =
        config.CACHE_STORAGE_URL ?? `file://${workingDirectory}/.cache.db`;
      break;
    default:
      break;
  }

  return {
    cacheDriver: config.CACHE_DRIVER ?? CacheDriver.Sqlite,
    cacheStorageUrl: cacheStorageUrl,
    cacheTtl: config.CACHE_TTL ?? 3600000,
  };
});
