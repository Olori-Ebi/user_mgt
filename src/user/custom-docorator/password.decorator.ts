import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  matches,
} from 'class-validator';

export function IsValidPassword(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidPassword',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: string) {
          const password = value;
          const passwordRegEx =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
          return matches(password, passwordRegEx);
        },
        defaultMessage: () => {
          return 'Password must contain Minimum 8 and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character';
        },
      },
    });
  };
}
