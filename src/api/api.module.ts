import { Module } from "@nestjs/common";

import { HomeModule } from "./home/home.module";

@Module({
  imports: [HomeModule],
  providers: [],
})
export class ApiModule {}
