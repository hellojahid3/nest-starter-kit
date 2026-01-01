import { SetMetadata } from "@nestjs/common";

export const SET_RESPONSE_MESSAGE_METADATA = "setResponseMessage";

export const SetResponseMessage = (message: string) =>
  SetMetadata(SET_RESPONSE_MESSAGE_METADATA, message);
