import * as crypto from "crypto";
import { type Response } from "express";
import { type Params as PinoParams } from "nestjs-pino";
import * as path from "path";

import { type Request } from "@/types/request";
import {
  EXCLUDED_LOG_PATHS,
  LOG_DATE_FORMAT,
  LOG_DIR,
  LOG_FILE_EXTENSION,
} from "./logger.constants";

const getFileTransport = (logLevel: string) => ({
  target: "pino-roll",
  level: logLevel,
  options: {
    file: path.join(process.cwd(), LOG_DIR, "app"),
    extension: `.${LOG_FILE_EXTENSION}`,
    dateFormat: LOG_DATE_FORMAT,
    frequency: "daily",
    size: "20M",
    limit: {
      count: 7,
      removeOtherLogFiles: true,
    },
  },
});

const getPrettyTransport = (logLevel: string) => ({
  target: "pino-pretty",
  level: logLevel,
  options: {
    colorize: true,
    levelFirst: true,
    singleLine: true,
    quietReqLogger: true,
    translateTime: "SYS:HH:MM:ss",
    ignore: "pid,hostname,res",
  },
});

export const getLoggerConfig = (
  environment: string = "development",
  logLevel: string = "info"
): PinoParams => {
  const isProduction = environment !== "development";

  return {
    pinoHttp: {
      transport: {
        level: logLevel,
        dedupe: true,
        targets: [
          ...(!isProduction ? [getPrettyTransport(logLevel)] : []),
          ...(isProduction
            ? [getFileTransport(logLevel), getPrettyTransport(logLevel)]
            : []),
        ],
      },
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "req.body.password",
          "req.body.passwordConfirm",
          "req.body.token",
          "req.body.accessToken",
          "req.body.refreshToken",
          "*.password",
          "*.token",
          "*.apiKey",
          "*.secret",
          "*.creditCard",
        ],
        censor: "[REDACTED]",
      },
      genReqId: (req: Request) => {
        return req.headers["x-request-id"] || crypto.randomUUID();
      },
      customSuccessMessage: (req: Request, res: Response) => {
        return `${req.method} ${req.url} completed with status ${res.statusCode}`;
      },
      customErrorMessage: (req: Request, res: Response, err: Error) => {
        return `${req.method} ${req.url} failed with status ${res.statusCode}: ${err.message}`;
      },
      autoLogging: {
        ignore: (req: Request) => {
          return EXCLUDED_LOG_PATHS.includes(req.url);
        },
      },
    },
  };
};
