export interface CreateNoteDto {
  content: string;
  owner: "Dev" | "Chairman";
  category: string;
}
