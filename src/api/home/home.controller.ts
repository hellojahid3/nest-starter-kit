import { Controller, Get, Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";

import { appConfig } from "@/app.config";
import * as packageJson from "../../../package.json";

@Controller()
export class HomeController {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>
  ) {}

  @Get()
  getHome() {
    return {
      name: this.config.name,
      version: packageJson.version,
      description: packageJson.description,
      status: "OK",
    };
  }
}
