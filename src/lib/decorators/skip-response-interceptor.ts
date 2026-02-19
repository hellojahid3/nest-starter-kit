import { SetMetadata } from "@nestjs/common";

export const SKIP_RESPONSE_INTERCEPTOR_METADATA = "skipResponseInterceptor";

export const SkipResponseInterceptor = () =>
  SetMetadata(SKIP_RESPONSE_INTERCEPTOR_METADATA, true);
