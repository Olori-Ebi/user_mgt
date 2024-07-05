import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword } from '../custom-docorator/password.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  identifier: string; // This can be either user_name or email

  @ApiProperty()
  @IsNotEmpty()
  @IsValidPassword()
  password: string;
}
