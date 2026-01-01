import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client/extension";

import { prismaConfig } from "./prisma.config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

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

  async onModuleInit() {
    this.logger.log("Connecting to database...");
    await this.$connect();
    this.logger.log("Connected to database");
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting from database...");
    await this.$disconnect();
    this.logger.log("Disconnected from database");
  }
}
