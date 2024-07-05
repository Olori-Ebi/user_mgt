import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { FindAllUsersQueryDto } from './dto/get-users.query.dto';
import { AuthGuard } from '../auth-middleware/auth.middleware';
import { AdminAuthGuard } from '../auth-middleware/admin-auth.middleware';
import { IUser } from './interface/user.interface';
import { HttpStatus } from '@nestjs/common';
import { UserRole } from './entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn().mockImplementation((dto: CreateUserDto) => {
      return { id: Date.now(), ...dto };
    }),
    login: jest.fn().mockImplementation((dto: LoginUserDto) => {
      return { token: 'test_token' };
    }),
    findAll: jest.fn().mockImplementation((authUser: IUser, query: FindAllUsersQueryDto) => {
      return { users: [], count: 0 };
    }),
    findOne: jest.fn().mockImplementation((id: number, authUser: IUser) => {
      return { id, full_name: 'Test User', email: 'test@example.com', role: 'user' };
    }),
    update: jest.fn().mockImplementation((authUser: IUser, id: number, dto: UpdateUserDto) => {
      return { id, ...dto };
    }),
    remove: jest.fn().mockImplementation((id: number, authUser: IUser) => {
      return { code: HttpStatus.OK, success: true, message: 'User deleted successfully' };
    }),
  };

  const mockAuthGuard = jest.fn().mockImplementation(() => true);
  const mockAdminAuthGuard = jest.fn().mockImplementation(() => true);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(AdminAuthGuard)
      .useValue(mockAdminAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = { email: 'test@example.com', user_name: 'testuser', full_name: 'Test User', password: 'Password123', role: UserRole.USER };
    expect(await controller.register(dto)).toEqual({
      id: expect.any(Number),
      ...dto,
    });
    expect(userService.create).toHaveBeenCalledWith(dto);
  });

  it('should login a user', async () => {
    const dto: LoginUserDto = { identifier: 'test@example.com', password: 'Password123' };
    expect(await controller.login(dto)).toEqual({ token: 'test_token' });
    expect(userService.login).toHaveBeenCalledWith(dto);
  });

  it('should fetch all users', async () => {
    const query: FindAllUsersQueryDto = { page: 1, limit: 10 };
    const authUser: IUser = { id: 1, deleted: false, email: 'admin@example.com', role: 'admin', user_name: 'testuser', full_name: 'Test User', password: 'Password123' };
    expect(await controller.findAll(authUser, query)).toEqual({ users: [], count: 0 });
    expect(userService.findAll).toHaveBeenCalledWith(authUser, query);
  });

  it('should fetch a user by id', async () => {
    const authUser: IUser = {id: 1, deleted: false, email: 'test@example.com', user_name: 'testuser', full_name: 'Test User', password: 'Password123', role: UserRole.USER };
    const id = 1;
    expect(await controller.findOne(authUser, id)).toEqual({
      id,
      full_name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });
    expect(userService.findOne).toHaveBeenCalledWith(id, authUser);
  });

  it('should update a user', async () => {
    const authUser: IUser = {id: 1, deleted: false, email: 'test@example.com', user_name: 'testuser', full_name: 'Test User', password: 'Password123', role: UserRole.USER };
    const id = 1;
    const dto: UpdateUserDto = { email: 'updated@example.com', full_name: 'Updated User' };
    expect(await controller.update(id, dto, authUser)).toEqual({ id, ...dto });
    expect(userService.update).toHaveBeenCalledWith(authUser, id, dto);
  });

  it('should delete a user', async () => {
    const authUser: IUser = {id: 1, deleted: false, email: 'test@example.com', user_name: 'testuser', full_name: 'Test User', password: 'Password123', role: UserRole.USER };
    const id = 1;
    expect(await controller.remove(authUser, id)).toEqual({
      code: HttpStatus.OK,
      success: true,
      message: 'User deleted successfully',
    });
    expect(userService.remove).toHaveBeenCalledWith(id, authUser);
  });
});
