import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  const normalizeOrigin = (origin?: string): string | undefined => {
    if (!origin) return undefined;

    try {
      const url = new URL(origin);
      const normalizedProtocol = url.protocol.toLowerCase();
      const normalizedHost = url.host.toLowerCase();

      // Normalize to "scheme://host" without path, query, or trailing slash
      return `${normalizedProtocol}//${normalizedHost}`;
    } catch {
      // Fallback: trim trailing slashes for non-URL-compatible strings
      return origin.replace(/\/+$/, "");
    }
  };

  const allowedOrigins = [
    configService.get<string>("DASHBOARD_URL"),
    "http://localhost:5173",
  ].filter(Boolean) as string[];

  const normalizedAllowedOrigins = allowedOrigins
    .map(normalizeOrigin)
    .filter(Boolean) as string[];

  // Enable cookie parser
  app.use(cookieParser());

  // Enable CORS for dashboard
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = normalizeOrigin(origin);
      const isAllowed =
        normalizedAllowedOrigins.includes(normalizedOrigin as string);
      callback(null, isAllowed);
    },
    credentials: true,
  });

  const configuredPort = Number(configService.get<string>("PORT"));
  const port =
    Number.isFinite(configuredPort) && configuredPort > 0
      ? configuredPort
      : 3000;

  await app.listen(port);

  logger.log(`API is running on http://localhost:${port}`);
}

bootstrap();
