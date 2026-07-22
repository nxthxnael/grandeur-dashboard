import { Request } from 'express';
import { UserRole } from './entities/user.entity';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}
