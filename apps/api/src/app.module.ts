import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { NotesModule } from "./notes/notes.module";
import { AuthController } from "./auth/auth.controller";
import { DomainController } from "./domains/domain.controller";
import { PointsController } from "./points/points.controller";
import * as path from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), "apps/api/.env"),
        path.resolve(process.cwd(), ".env"),
      ],
    }),
    DatabaseModule,
    NotesModule,
  ],
  controllers: [AuthController, DomainController, PointsController],
})
export class AppModule {}
