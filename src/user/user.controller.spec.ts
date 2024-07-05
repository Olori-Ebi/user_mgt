import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpStatus } from '@nestjs/common';
import { UserRole } from './entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call userService.create with correct parameters and return the result', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        user_name: 'testuser',
        full_name: 'Test User',
        password: 'Password123',
        role: UserRole.USER,
      };

      const mockResponse = {
        code: HttpStatus.CREATED,
        success: true,
        message: "User created successfully",
        data: {
          id: 1,
          email: createUserDto.email,
          user_name: createUserDto.user_name,
          full_name: createUserDto.full_name,
          role: createUserDto.role,
          token: 'mockToken',
          deleted: false,
          password: undefined
        },
      };

      // Mock the userService.create method
      jest.spyOn(userService, 'create').mockResolvedValue(mockResponse);

      // Call the controller method
      const result = await controller.register(createUserDto);

      // Assert the result
      expect(result).toEqual(mockResponse);

      // Verify userService.create was called with the correct parameters
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
