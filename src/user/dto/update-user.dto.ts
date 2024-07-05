import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  full_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;
}
