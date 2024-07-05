import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';
import { JwtService } from './jwt.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { FindAllUsersQueryDto } from './dto/get-users.query.dto';
import { IUser } from './interface/user.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Creating a new user for ${createUserDto.full_name}`);
    const { email, user_name } = createUserDto;

    const existingUser = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.role',
        'user.full_name',
        'user.user_name',
      ])
      .where('user.email = :email OR user.user_name = :user_name', {
        email,
        user_name,
      })
      .getOne();

    if (existingUser) {
      if (existingUser.email === email) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
      if (existingUser.user_name === user_name) {
        throw new HttpException('Username already exists', HttpStatus.CONFLICT);
      }
    }

    const user = this.userRepository.create({ ...createUserDto });
    await this.userRepository.save(user);

    const token = await this.jwtService.generateAccessToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    delete user.password;

    return {
      code: HttpStatus.CREATED,
      success: true,
      message: 'User created successfully',
      data: { ...user, token },
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { identifier: emailOrUsername, password } = loginUserDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .select()
      .where('user.email = :identifier OR user.user_name = :identifier', {
        identifier: emailOrUsername,
      })
      .getOne();

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
    delete user.password;

    return {
      message: 'Login successful',
      data: { ...user, token },
    };
  }

  async findAll(authUser: IUser, query: FindAllUsersQueryDto) {
    const { user_name, email, page = 1, limit = 10 } = query;
    const where: any = {
      deleted: false,
      id: Not(authUser.id),
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
      select: ['id', 'full_name', 'user_name', 'email', 'role'],
    });

    return { users, count };
  }

  async validateUserAuthorizationAndReturnUser(id: number, authUserId: number) {
    if (id !== authUserId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.full_name', 'user.email', 'user.role'])
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findOne(id: number, authUser: IUser) {
    return await this.validateUserAuthorizationAndReturnUser(id, authUser.id);
  }

  async update(authUser: IUser, id: number, updateUserDto: UpdateUserDto) {
    const user = await this.validateUserAuthorizationAndReturnUser(
      id,
      authUser.id,
    );

    if (updateUserDto.email) {
      const existingEmailUser = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      });
      if (existingEmailUser) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
    }

    user.email = updateUserDto.email || user.email;
    user.full_name = updateUserDto.full_name || user.full_name;

    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }

  async remove(id: number, authUser: IUser) {
    const user = await this.validateUserAuthorizationAndReturnUser(
      id,
      authUser.id,
    );

    user.deleted = true;
    await this.userRepository.save(user);

    return {
      code: HttpStatus.OK,
      success: true,
      message: 'User deleted successfully',
    };
  }
}
