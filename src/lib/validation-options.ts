import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipeOptions,
} from "@nestjs/common";

const generateErrors = (
  errors: ValidationError[]
): { [key: string]: string | Record<string, unknown> } => {
  return errors.reduce<{ [key: string]: string | Record<string, unknown> }>(
    (accumulator, currentValue) => ({
      ...accumulator,
      [currentValue.property]:
        (currentValue.children?.length ?? 0) > 0
          ? generateErrors(currentValue.children ?? [])
          : Object.values(currentValue.constraints ?? {}).join(", "),
    }),
    {}
  );
};

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) => {
    return new UnprocessableEntityException(generateErrors(errors));
  },
};

export default validationOptions;
