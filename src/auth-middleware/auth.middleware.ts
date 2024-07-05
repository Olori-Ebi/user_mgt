import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtService } from '../user/jwt.service';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    request.user = await this.validateRequest(request);
    return true;
  }

  async validateRequest(request: { headers: { authorization: string } }) {
    if (!request.headers.authorization) {
      throw new HttpException('No Auth Token', HttpStatus.UNAUTHORIZED);
    }
    const auth = request.headers.authorization;
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const token = auth.split(' ')[1];
    try {
      const user = this.jwtService.verifyToken(token);
      return await this.userRepository.findOne({ where: { id: user.id } });
    } catch (error) {
      const message = `Token error: ${error.message || error.name}`;
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }
  }
}
