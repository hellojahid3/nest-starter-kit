import type { TransformFnParams } from "class-transformer";

export const stringToLower = (params: TransformFnParams): string | undefined =>
  typeof params.value === "string"
    ? params.value.toLowerCase().trim()
    : undefined;
