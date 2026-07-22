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

        // Set NODE_TLS_REJECT_UNAUTHORIZED for pg library before pool creation
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        // Use connection string directly to respect SSL parameters
        const pool = new Pool({
          connectionString: connectionString,
          ssl: {
            rejectUnauthorized: false,
          },
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
