import { registerDecorator, ValidationOptions, matches } from 'class-validator';

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
            /^[a-zA-Z0-9]{6,20}$/;
          return matches(password, passwordRegEx);
        },
        defaultMessage: () => {
          return 'Password must contain Minimum 6 and maximum 20 characters';
        },
      },
    });
  };
}
