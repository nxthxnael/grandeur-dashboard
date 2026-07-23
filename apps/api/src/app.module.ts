import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { NotesModule } from "./notes/notes.module";
import { AuthModule } from "./auth/auth.module";
import { AuthController } from "./auth/auth.controller";
import { DomainController } from "./domains/domain.controller";
import { PointsController } from "./points/points.controller";
import { HealthController } from "./health/health.controller";
import * as path from "path";

// Get the monorepo root directory (4 levels up from apps/api/src)
const rootDir = path.resolve(__dirname, "../../../../");

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(rootDir, "apps/api/.env"),
        path.resolve(rootDir, ".env"),
      ],
    }),
    DatabaseModule,
    NotesModule,
    AuthModule,
  ],
  controllers: [
    HealthController,
    AuthController,
    DomainController,
    PointsController,
  ],
})
export class AppModule {}
