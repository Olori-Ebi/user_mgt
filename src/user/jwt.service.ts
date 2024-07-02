import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from './interface/access_token.interface';
@Injectable()
export class JwtService {
  private readonly logger: Logger;
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(JwtService.name);
  }
  generateAccessToken(data: AccessTokenPayload) {
    return jwt.sign(data, this.configService.get<string>('SECRET'), {
      expiresIn: '1h',
    });
  }
}
