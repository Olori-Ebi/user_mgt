import { IsOptional, IsNumberString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class FindAllUsersQueryDto {
  @IsOptional()
  user_name?: string;

  @IsOptional()
  email?: string;

  @IsNumberString()
  @IsOptional()
  page: number;

  @IsNumberString()
  @IsOptional()
  limit: number;
}

export interface Where {
    user_name?: string, email?: string, deleted: boolean, role: UserRole 
}