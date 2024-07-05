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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../auth-middleware/auth.middleware';
import { AdminAuthGuard } from '../auth-middleware/admin-auth.middleware';
import { FindAllUsersQueryDto } from './dto/get-users.query.dto';
import { AuthUser } from './custom-docorator/user.decorator';
import { IUser } from './interface/user.interface';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('/')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiTags('Users')
  @ApiOperation({ summary: 'User create' })
  @ApiOkResponse({
    description: 'user successfully registered.',
  })
  @Post('users')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiTags('Login')
  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({
    description: 'user successfully logged in.',
  })
  @Post('auth/login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @ApiTags('Admin')
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Fetch Users' })
  @ApiOkResponse({
    description: 'users fetched successfully.',
  })
  @UseGuards(AdminAuthGuard)
  @Get('users')
  findAll(@AuthUser() authUser: IUser, @Query() query: FindAllUsersQueryDto) {
    return this.userService.findAll(authUser, query);
  }

  @ApiTags('Users')
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Fetch User' })
  @ApiOkResponse({
    description: 'user fetched successfully.',
  })
  @UseGuards(AuthGuard)
  @Get('users/:id')
  findOne(@AuthUser() authUser: IUser, @Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id, authUser);
  }

  @ApiTags('Users')
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Update User' })
  @ApiOkResponse({
    description: 'user updated successfully.',
  })
  @UseGuards(AuthGuard)
  @Patch('users/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @AuthUser() authUser: IUser,
  ) {
    return this.userService.update(authUser, id, updateUserDto);
  }

  @ApiTags('Users')
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Delete User' })
  @ApiOkResponse({
    description: 'user deleted successfully.',
  })
  @UseGuards(AuthGuard)
  @Delete('users/:id')
  remove(@AuthUser() authUser: IUser, @Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id, authUser);
  }
}
