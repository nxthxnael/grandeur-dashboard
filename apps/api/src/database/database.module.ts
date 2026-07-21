import { Module, Global, OnModuleDestroy, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { DATABASE_POOL } from "./tokens";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>("DATABASE_URL");

        if (!connectionString) {
          throw new Error("DATABASE_URL environment variable is not set");
        }

        // Parse connection string to handle URL-encoded password
        const url = new URL(connectionString);
        const password = decodeURIComponent(url.password);

        // SSL configuration - defaults to secure settings
        const sslEnabled = configService.get<boolean>(
          "DATABASE_SSL_ENABLED",
          true,
        );
        const rejectUnauthorized = configService.get<boolean>(
          "DATABASE_SSL_REJECT_UNAUTHORIZED",
          true,
        );

        const pool = new Pool({
          host: url.hostname,
          port: parseInt(url.port) || 5432,
          database: url.pathname.slice(1), // Remove leading slash
          user: url.username,
          password: password,
          ssl: sslEnabled
            ? {
                rejectUnauthorized,
              }
            : false,
        });
        return pool;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onModuleDestroy() {
    await this.pool.end();
  }
}
