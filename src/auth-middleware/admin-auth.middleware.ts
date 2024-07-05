import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { JwtService } from '../user/jwt.service';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.validateRequest(request);
    if (user.role !== UserRole.ADMIN) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    request.user = user;
    return true;
  }

  async validateRequest(request: { headers: { authorization: any } }) {
    if (!request.headers.authorization) {
      throw new HttpException('No Auth Token', HttpStatus.UNAUTHORIZED);
    }
    const auth = request.headers.authorization;
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const token = auth.split(' ')[1];
    try {
      const decoded = this.jwtService.verifyToken(token);
      const user = await this.userRepository.findOne({
        where: { id: decoded.id },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }
      return user;
    } catch (error) {
      const message = `Token error: ${error.message || error.name}`;
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }
  }
}
