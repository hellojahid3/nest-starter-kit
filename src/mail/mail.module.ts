import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { appConfig } from "@/app.config";
import { mailConfig } from "./mail.config";
import { MailService } from "./mail.service";

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(mailConfig),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
