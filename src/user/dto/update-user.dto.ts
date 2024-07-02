import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  full_name?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;
}