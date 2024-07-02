import { NestMiddleware, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    try {
      const offuscateRequest = JSON.parse(JSON.stringify(req.body));
      if (offuscateRequest && offuscateRequest.password)
        offuscateRequest.password = '*******';
        console.log(
          new Date().toString() +
            ' - [Request] ' +
            req.baseUrl +
            ' - ' +
            JSON.stringify(offuscateRequest),
        );
    } catch (error) {}
    next();
  }
}
