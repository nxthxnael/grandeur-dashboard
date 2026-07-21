import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [DatabaseModule, CacheModule.register()],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
