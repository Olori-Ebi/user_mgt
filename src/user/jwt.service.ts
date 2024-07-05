import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { IAccessTokenPayload } from './interface/access_token.interface';
@Injectable()
export class JwtService {
  private readonly logger: Logger;
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(JwtService.name);
  }

  private SECRET: string = this.configService.get<string>('SECRET');
  generateAccessToken(data: IAccessTokenPayload) {
    return jwt.sign(data, this.SECRET, {
      expiresIn: '1h',
    });
  }

  verifyToken(hash: string) {
    try {
      return jwt.verify(hash, this.SECRET);
    } catch (error) {
      this.logger.log('error occurred verifing token', error.message);
      throw new HttpException('Invalid Hash', HttpStatus.BAD_REQUEST);
    }
  }
}
