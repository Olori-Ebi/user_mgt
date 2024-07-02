import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from 'src/auth-middleware/auth.middleware';
import { AdminAuthGuard } from 'src/auth-middleware/admin-auth.middleware';
import { FindAllUsersQueryDto } from './dto/get-users.query.dto';
import { AuthUser } from './custom-docorator/user.decorator';
import { IUser } from './interface/user.interface';
import { ExcludePasswordPipe } from './custom-pipe';

@Controller('/')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('auth/login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('users')
  @UsePipes(ExcludePasswordPipe)
  findAll(@Query() query: FindAllUsersQueryDto) {
    return this.userService.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Get('users/:id')
  findOne(@AuthUser() authUser: IUser, @Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id, authUser);
  }

  @UseGuards(AuthGuard)
  @Patch('users/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete('users/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
