import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { CacheHealthIndicator } from "@/cache/cache.health";
import { PrismaModule } from "@/prisma/prisma.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [TerminusModule, HttpModule, PrismaModule],
  controllers: [HealthController],
  providers: [CacheHealthIndicator],
})
export class HealthModule {}
