import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(helmet());

  app.enableCors({
    origin: '*', // You can specify a list of allowed origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API documentation for the User Management application')
    .setVersion('0.0.1')
    .addBearerAuth(
      {
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Token',
      },
      'Bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/doc', app, document);

  await app.listen(3000);
}

bootstrap();
