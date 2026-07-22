export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  approved_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}
