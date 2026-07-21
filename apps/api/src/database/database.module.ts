import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";

@Global()
@Module({
  providers: [
    {
      provide: "DATABASE_POOL",
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>("DATABASE_URL");

        if (!connectionString) {
          throw new Error("DATABASE_URL environment variable is not set");
        }

        // Parse connection string to handle URL-encoded password
        const url = new URL(connectionString);
        const password = decodeURIComponent(url.password);

        const pool = new Pool({
          host: url.hostname,
          port: parseInt(url.port) || 5432,
          database: url.pathname.slice(1), // Remove leading slash
          user: url.username,
          password: password,
          ssl: {
            rejectUnauthorized: false, // Required for Supabase
          },
        });
        return pool;
      },
      inject: [ConfigService],
    },
  ],
  exports: ["DATABASE_POOL"],
})
export class DatabaseModule {}
