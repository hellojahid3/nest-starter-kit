import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { appConfig } from "@/app.config";
import { HomeController } from "./home.controller";

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  controllers: [HomeController],
  providers: [],
})
export class HomeModule {}
