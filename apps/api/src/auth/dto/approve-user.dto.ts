import { IsEmail } from 'class-validator';

export class ApproveUserDto {
  @IsEmail()
  email: string;
}
