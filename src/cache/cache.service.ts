import { CacheOptions, CacheOptionsFactory } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { createKeyv } from "@keyv/redis";
import KeyvSqlite from "@keyv/sqlite";
import { CacheableMemory } from "cacheable";
import { Keyv } from "keyv";

import { cacheConfig } from "./cache.config";
import { CacheDriver } from "./cache.enum";

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
      new Keyv({
        store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
      })
    );

    if (this.cacheConfiguration.cacheDriver === CacheDriver.Sqlite) {
      stores.push(
        new Keyv({
          store: new KeyvSqlite(this.cacheConfiguration.cacheStorageUrl),
        })
      );
    }

    if (this.cacheConfiguration.cacheDriver === CacheDriver.Redis) {
      stores.push(createKeyv(this.cacheConfiguration.cacheStorageUrl));
    }

    return stores;
  }
}
