import { CacheOptions, CacheOptionsFactory } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { createKeyv } from "@keyv/redis";
import { Keyv } from "keyv";

import { cacheConfig } from "./cache.config";

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(
    @Inject(cacheConfig.KEY)
    private readonly cacheConfiguration: ConfigType<typeof cacheConfig>
  ) {}

  createCacheOptions(): CacheOptions {
    return {
      stores: this.createCacheStore(),
      ttl: this.cacheConfiguration.cacheTtl,
    };
  }

  private createCacheStore(): Keyv[] {
    const stores: Keyv[] = [];

    stores.push(
      createKeyv(
        `redis://${this.cacheConfiguration.username ?? "default"}:${this.cacheConfiguration.password ?? ""}@${this.cacheConfiguration.host}:${this.cacheConfiguration.port}`
      )
    );

    return stores;
  }
}
