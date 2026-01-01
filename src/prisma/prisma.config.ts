import { registerAs } from "@nestjs/config";
import { IsNotEmpty, IsString } from "class-validator";

import validateConfig from "@/lib/validate-config";

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;
}

export const prismaConfig = registerAs("prisma", () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    databaseUrl: config.DATABASE_URL,
  };
});
