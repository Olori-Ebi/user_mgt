import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from './jwt.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { FindAllUsersQueryDto, Where } from './dto/get-users.query.dto';
import { IUser } from './interface/user.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      this.logger.log('Creating a new user');
      const { email, user_name, full_name, password, role } = createUserDto;

      const existingEmailUser = await this.userRepository.findOneBy({ email });
      if (existingEmailUser) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const existingUsernameUser = await this.userRepository.findOneBy({ user_name });
      if (existingUsernameUser) {
        throw new HttpException('Username already exists', HttpStatus.CONFLICT);
      }

      const user = this.userRepository.create({
        email,
        user_name,
        full_name,
        password,
        role,
      });
      await this.userRepository.save(user);

      const token = await this.jwtService.generateAccessToken({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      return {
        code: HttpStatus.CREATED,
        success: true,
        message: 'User created successfully',
        data: {
          id: user.id,
          full_name: user.full_name,
          user_name: user.user_name,
          email: user.email,
          token,
        },
      };
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('An error occurred. Try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { identifier, password } = loginUserDto;

      const user = identifier.includes('@')
        ? await this.userRepository.findOneBy({ email: identifier })
        : await this.userRepository.findOneBy({ user_name: identifier });

      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const isPasswordMatching = await bcrypt.compare(password, user.password);
      if (!isPasswordMatching) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const token = await this.jwtService.generateAccessToken({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      return {
        message: 'Login successful',
        token,
      };
    } catch (error) {
      this.logger.error(`Error logging in: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('An error occurred. Try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(query: FindAllUsersQueryDto) {
    try {
      const { user_name, email, page = 1, limit = 10 } = query;
      const where: Where = {
        deleted: false,
        role: UserRole.USER,
      };

      if (user_name) {
        where.user_name = user_name;
      }

      if (email) {
        where.email = email;
      }

      const [users, count] = await this.userRepository.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
      });

      const usersWithoutPassword = users.map(({ password, ...rest }) => rest);

      return { users: usersWithoutPassword, count };
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('An error occurred. Try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number, authUser: IUser) {
    console.log({id, authUser})
    try {
      if (id != authUser.id) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      // const { password, ...rest } = user;
      return user;
    } catch (error) {
      this.logger.error(`Error fetching user: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('An error occurred. Try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (updateUserDto.email) {
        const existingEmailUser = await this.userRepository.findOneBy({ email: updateUserDto.email });
        if (existingEmailUser) {
          throw new HttpException('Email already exists', HttpStatus.CONFLICT);
        }
      }

      user.email = updateUserDto.email || user.email;
      user.full_name = updateUserDto.full_name || user.full_name;

      const updatedUser = await this.userRepository.save(user);
      const { password, ...rest } = updatedUser;
      return rest;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('An error occurred. Try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      user.deleted = true;
      await this.userRepository.save(user);

      return {
        code: HttpStatus.OK,
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('An error occurred. Try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
