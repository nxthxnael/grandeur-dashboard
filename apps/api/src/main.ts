import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  // Enable CORS for dashboard
  app.enableCors({
    origin:
      configService.get<string>("DASHBOARD_URL") || "http://localhost:5173",
    credentials: true,
  });

  const port = configService.get<number>("PORT") || 3000;
  await app.listen(port);

  logger.log(`API is running on http://localhost:${port}`);
}

bootstrap();
