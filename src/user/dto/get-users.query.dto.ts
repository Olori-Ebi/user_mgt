import { IsOptional, IsNumberString } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindAllUsersQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  user_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsNumberString()
  @IsOptional()
  limit: number;
}

export interface Where {
  user_name?: string;
  email?: string;
  deleted: boolean;
  role: UserRole;
}
