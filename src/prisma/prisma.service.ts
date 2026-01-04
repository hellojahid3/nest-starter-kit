import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { prismaConfig } from "./prisma.config";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(
    @Inject(prismaConfig.KEY)
    private readonly config: ConfigType<typeof prismaConfig>
  ) {
    super({
      adapter: new PrismaPg({
        connectionString: config.databaseUrl,
      }),
    });
  }
}
