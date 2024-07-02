import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from './jwt.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger('UserService');
  }
  async create(createUserDto: CreateUserDto) {
    try {
      this.logger.log('In create user service');
      const { email, user_name, full_name, password, role } = createUserDto;
      const checkEmailExist = await this.userRepository.findOneBy({ email });
      if (checkEmailExist) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const checkUserNameExist = await this.userRepository.findOneBy({
        user_name,
      });
      if (checkUserNameExist) {
        throw new HttpException('Username already exist', HttpStatus.CONFLICT);
      }

      const user: User = new User();
      user.email = email;
      user.full_name = full_name;
      user.user_name = user_name;
      user.password = password;
      user.role = role;

      await this.userRepository.save(user);
      const token = await this.jwtService.generateAccessToken({
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
      this.logger.error(
        `Error in create method: ${error.message}`,
        error.stack,
      );
      // Check if the error is an instance of HttpException and rethrow it if it is
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error.message || 'An error occurred. Try again';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { identifier, password } = loginUserDto;

      const isEmail = identifier.includes('@');

      let user: User;
      if (isEmail) {
        user = await this.userRepository.findOneBy({ email: identifier });
      } else {
        user = await this.userRepository.findOneBy({ user_name: identifier });
      }

      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const isPasswordMatching = await bcrypt.compare(password, user.password);

      if (!isPasswordMatching) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const generatedToken = await this.jwtService.generateAccessToken({
        role: user.role,
        email: user.email,
      });

      return {
        message: 'Login successful',
        token: generatedToken,
      };
    } catch (error) {
      this.logger.error(`Error in login method: ${error.message}`, error.stack);
      // Check if the error is an instance of HttpException and rethrow it if it is
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error.message || 'An error occurred. Try again';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, _updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
