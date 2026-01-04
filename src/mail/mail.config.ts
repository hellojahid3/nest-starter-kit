import { registerAs } from "@nestjs/config";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import validateConfig from "@/lib/validate-config";

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  MAIL_HOST: string;

  @IsString()
  @IsNotEmpty()
  MAIL_PORT: string;

  @IsOptional()
  @IsEnum(["ssl", "tls"])
  MAIL_ENCRYPTION: string;

  @IsString()
  @IsNotEmpty()
  MAIL_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  MAIL_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM_NAME: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM_ADDRESS: string;

  @IsOptional()
  @IsString()
  MAIL_MAX_CONNECTIONS: string;

  @IsOptional()
  @IsString()
  MAIL_MAX_MESSAGES: string;
}

export const mailConfig = registerAs("mail", () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: config.MAIL_HOST,
    port: parseInt(config.MAIL_PORT ?? "587", 10),
    encryption: config.MAIL_ENCRYPTION ?? "tls",
    username: config.MAIL_USERNAME,
    password: config.MAIL_PASSWORD,
    fromName: config.MAIL_FROM_NAME,
    fromAddress: config.MAIL_FROM_ADDRESS,
    maxConnections: parseInt(config.MAIL_MAX_CONNECTIONS ?? "5", 10),
    maxMessages: parseInt(config.MAIL_MAX_MESSAGES ?? "100", 10),
  };
});
