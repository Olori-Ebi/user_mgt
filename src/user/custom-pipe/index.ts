import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ExcludePasswordPipe implements PipeTransform {
  transform(value: any) {
    if (Array.isArray(value)) {
      return value.map(this.excludePassword);
    } else {
      return this.excludePassword(value);
    }
  }

  private excludePassword(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
