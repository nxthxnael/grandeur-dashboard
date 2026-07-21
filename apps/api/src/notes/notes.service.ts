import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Pool } from "pg";
import { DATABASE_POOL } from "../database/tokens";
import { CreateNoteDto } from "./notes.dto";

export interface Note {
  id: string;
  content: string;
  owner: string;
  category: string;
  created_at: Date;
}

@Injectable()
export class NotesService {
  private readonly CACHE_KEY = "notes";
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async createNote(dto: CreateNoteDto): Promise<Note> {
    const result = await this.pool.query(
      "INSERT INTO notes (content, owner, category) VALUES ($1, $2, $3) RETURNING *",
      [dto.content, dto.owner, dto.category],
    );

    // Invalidate cache on create
    await this.cacheManager.del(this.CACHE_KEY);

    return result.rows[0];
  }

  async getNotes(): Promise<Note[]> {
    // Try to get from cache first
    const cached = await this.cacheManager.get<Note[]>(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const result = await this.pool.query(
      "SELECT * FROM notes ORDER BY created_at DESC",
    );

    const notes = result.rows;

    // Store in cache
    await this.cacheManager.set(this.CACHE_KEY, notes, this.CACHE_TTL);

    return notes;
  }
}
