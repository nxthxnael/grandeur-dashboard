import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { NotesService } from "./notes.service";
import { CreateNoteDto } from "./notes.dto";

@Controller("v1/notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createNote(@Body() dto: CreateNoteDto) {
    return this.notesService.createNote(dto);
  }

  @Get()
  getNotes() {
    return this.notesService.getNotes();
  }
}
