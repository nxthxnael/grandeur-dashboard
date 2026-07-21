import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NotesService, CreateNoteDto } from './notes.service';

@Controller('v1/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNote(@Body() dto: CreateNoteDto) {
    return await this.notesService.createNote(dto);
  }

  @Get()
  async getNotes() {
    return await this.notesService.getNotes();
  }
}
