import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  // Enable cookie parser
  app.use(cookieParser());

  // Enable CORS for dashboard
  app.enableCors({
    origin: (origin: string | undefined) => {
      const allowedOrigins = [
        configService.get<string>("DASHBOARD_URL"),
        "http://localhost:5173",
      ].filter(Boolean);
      return !origin || allowedOrigins.includes(origin);
    },
    credentials: true,
  });

  const port =
    configService.get<number>("PORT") ||
    parseInt(process.env.PORT || "3000", 10);
  await app.listen(port);

  logger.log(`API is running on http://localhost:${port}`);
}

bootstrap();
