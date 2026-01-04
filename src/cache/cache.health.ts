import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from "@nestjs/terminus";
import { Cache } from "cache-manager";

@Injectable()
export class CacheHealthIndicator {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly healthIndicatorService: HealthIndicatorService
  ) {}

  async check(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.cacheManager.set("health:check:key", "ok", 1000);
      const status = await this.cacheManager.get("health:check:key");

      const isHealthy = status === "ok";

      if (!isHealthy) {
        return indicator.down();
      }

      return indicator.up();
    } catch {
      return indicator.down();
    }
  }
}
