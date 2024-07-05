import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { JwtService } from './jwt.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { IUser } from './interface/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersQueryDto } from './dto/get-users.query.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        JwtService,
        ConfigService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test_secret')
          },
        },
        {
          provide: JwtService,
          useValue: {
            generateAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('userRepository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    it('Should create a new user and return its data', async () => {
      const createUserDto = {
        email: 'test@example.com',
        user_name: 'testuser',
        full_name: 'Test User',
        password: 'Password123',
        role: UserRole.USER,
      } as CreateUserDto;

      const savedUser = {
        ...createUserDto,
        id: 1,
        password: undefined,
      };

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async (password, saltRounds) => {
          expect(password).toBe('Password123');
          expect(saltRounds).toBe(10);
          return 'hashedPassword';
        });
      jest.spyOn(userRepository, 'create').mockReturnValue(savedUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser as User);
      jest
        .spyOn(jwtService, 'generateAccessToken')
        .mockReturnValue('mockToken');

      const result = await service.create(createUserDto);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result.data.token).toBe('mockToken');
      expect(result.code).toBe(HttpStatus.CREATED);
    });
    it('should throw an error if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        user_name: 'testuser',
        full_name: 'Test User',
        password: 'Password123',
        role: UserRole.USER,
      } as CreateUserDto;

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(userRepository, 'create').mockReturnValue(createUserDto as any);
      jest.spyOn(userRepository, 'save').mockRejectedValue({
        "statusCode": 409,
        "timestamp": "2024-07-04T22:47:52.032Z",
        "path": "/api/users",
        "message": "Email already exists"
    });

      try {
        const res = await service.create(createUserDto);
        fail('Expected create to throw an error for existing email');
      } catch (error) {
        expect(error.statusCode).toBe(HttpStatus.CONFLICT);
        expect(error.message).toBe('Email already exists');
      }
    });
  });
  describe('login', () => {
    it('should log in a user with valid credentials', async () => {
      const loginUserDto = { identifier: 'test@example.com', password: 'Password@123' };
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'Hashedpassword@123',
        role: UserRole.USER,
        full_name: 'testuser',
        deleted: false,
        hashPassword: jest.fn(),
      };
  
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnThis();
      jest.spyOn(userRepository.createQueryBuilder(), 'select').mockReturnThis();
      jest.spyOn(userRepository.createQueryBuilder(), 'where').mockReturnThis();
      jest.spyOn(userRepository.createQueryBuilder(), 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'generateAccessToken').mockReturnValue('accessToken');
  
      await service.login(loginUserDto);
  
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password@123', 'Hashedpassword@123');
      expect(jwtService.generateAccessToken).toHaveBeenCalledWith({
        id: 1,
        role: 'user',
        email: 'test@example.com',
      });
    });
  
    it('should throw an error for user with invalid credentials', async () => {
      const loginUserDto = { identifier: 'test1@example.com', password: 'Password@123' };
  
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnThis();
      jest.spyOn(userRepository.createQueryBuilder(), 'select').mockReturnThis();
      jest.spyOn(userRepository.createQueryBuilder(), 'where').mockReturnThis();
      jest.spyOn(userRepository.createQueryBuilder(), 'getOne').mockResolvedValue(undefined);
  
      try {
        await service.login(loginUserDto);
        fail('Expected login to throw an error for invalid credentials');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });
  describe('findAll', () => {
    const mockUserAdmin: IUser = { id: 1, email: 'admin@example.com', role: 'admin',  full_name: "admin one", password: "Adminone@123", deleted: false, user_name: 'adminOne'  };

    it('should fetch users for admin', async () => {
      const query: FindAllUsersQueryDto = {
        user_name: 'testuser',
        email: 'test@example.com',
        page: 1,
        limit: 10,
      };

      const mockUsers: Partial<User[]> = [
        { id: 1, user_name: 'testuser1', email: 'test1@example.com', role: UserRole.USER, full_name: "test one", password: "Testone@123", deleted: false, hashPassword: jest.fn() },
        { id: 2, user_name: 'testuser2', email: 'test2@example.com', role: UserRole.USER, full_name: "test two", password: "Testtwo@123", deleted: false, hashPassword: jest.fn() },
      ];

      jest.spyOn(userRepository, 'findAndCount').mockResolvedValue([mockUsers, mockUsers.length]);

      const result = await service.findAll(mockUserAdmin, query);

      expect(result.users).toEqual(mockUsers);
      expect(result.count).toBe(mockUsers.length);
      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          deleted: false,
          id: expect.anything(), // Authenticated user's ID should not match
          user_name: query.user_name,
          email: query.email,
        },
        skip: 0,
        take: 10,
        select: ['id', 'full_name', 'user_name', 'email', 'role'],
      });
    });
  });
  describe('findOne', () => {
    it('should find and return user when authorized', async () => {
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'Hashedpassword@123',
        role: UserRole.USER,
        full_name: 'testuser',
        deleted: false,
      };
      mockUserRepository.getOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1, mockUser);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockUserRepository.select).toHaveBeenCalledWith(['user.id', 'user.full_name', 'user.email', 'user.role']);
      expect(mockUserRepository.where).toHaveBeenCalledWith('user.id = :id', { id: 1 });
    });

    it('should throw HttpException when user is not found', async () => {
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'Hashedpassword@123',
        role: UserRole.USER,
        full_name: 'testuser',
        deleted: false,
      };
      mockUserRepository.getOne.mockResolvedValue(undefined);
      try {
        await service.findOne(1, mockUser);
        fail('Expected findOne to throw HttpException');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('User not found');
      }

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockUserRepository.select).toHaveBeenCalledWith(['user.id', 'user.full_name', 'user.email', 'user.role']);
      expect(mockUserRepository.where).toHaveBeenCalledWith('user.id = :id', { id: 1 });
    });

    it('should throw HttpException when user authorization fails', async () => {
      const mockUser: IUser = {
        id: 2,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'Hashedpassword@123',
        role: UserRole.USER,
        full_name: 'testuser',
        deleted: false,
      };

      try {
        await service.findOne(1, mockUser );
        fail('Expected findOne to throw HttpException');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.message).toBe('Unauthorized');
      }
    });
  });
  describe('update', () => {
    // const mockUser: Partial<IUser> = { id: 1, email: 'test@example.com', role: 'user' };

    it('should update user email and full name', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
        full_name: 'Updated User',
      };
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'Hashedpassword@123',
        role: UserRole.USER,
        full_name: 'testuser',
        deleted: false,
      };
      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
      };

      mockUserRepository.getOne.mockResolvedValue(mockUser);
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser, 1, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: updateUserDto.email });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw HttpException when trying to update with existing email', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
        full_name: 'Updated User',
      };
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'Hashedpassword@123',
        role: UserRole.USER,
        full_name: 'testuser',
        deleted: false,
      };

      mockUserRepository.getOne.mockResolvedValue(mockUser);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser); // Simulating existing email

      try {
        await service.update(mockUser, 1, updateUserDto);
        fail('Expected update to throw HttpException for existing email');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.message).toBe('Email already exists');
      }

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: updateUserDto.email });
    });

    it('should throw HttpException when user authorization fails', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
        full_name: 'Updated User',
      };

      const mockUser: IUser = {
        id: 2,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'Hashedpassword@123',
        role: UserRole.USER,
        full_name: 'testuser',
        deleted: false,
      };

      try {
        await service.update(mockUser, 1, updateUserDto); // Unauthorized user
        fail('Expected update to throw HttpException for unauthorized user');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.message).toBe('Unauthorized');
      }
    });
  });
  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'Hashedpassword@123',
        role: UserRole.USER,
        full_name: 'testuser',
        deleted: false,
      };

      mockUserRepository.getOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, deleted: true });

      const result = await service.remove(1, mockUser);

      expect(result).toEqual({
        code: HttpStatus.OK,
        success: true,
        message: 'User deleted successfully',
      });
      expect(mockUser.deleted).toBe(true);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw HttpException when trying to remove a non-existent user', async () => {
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'Hashedpassword@123',
        role: UserRole.USER,
        full_name: 'testuser',
        deleted: false,
      };
      mockUserRepository.getOne.mockResolvedValue(null);

      try {
        await service.remove(1, mockUser);
        fail('Expected remove to throw HttpException for non-existent user');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('User not found');
      }
    });

    it('should throw HttpException when user authorization fails', async () => {
      const mockUser: IUser = {
        id: 1,
        email: 'another@example.com',
        full_name: 'Another User',
        user_name: 'another_user',
        deleted: false,
        password: 'Hashedpassword@123',
        role: UserRole.USER,
      };

      mockUserRepository.getOne.mockResolvedValue(mockUser);

      try {
        await service.remove(2, mockUser);
        fail('Expected remove to throw HttpException for unauthorized user');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.message).toBe('Unauthorized');
      }
    });
  });
});

