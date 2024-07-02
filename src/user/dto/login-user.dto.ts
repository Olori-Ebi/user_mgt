import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword } from '../custom-docorator/password.decorator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  identifier: string; // This can be either user_name or email

  @IsNotEmpty()
  @IsValidPassword()
  password: string;
}
