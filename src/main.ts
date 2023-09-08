import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as socketio from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomExceptionFilter } from './common/exception/exception.filter';

const port = process.env.PORT || 5000;

async function bootstrap() {
  console.log('PORT:', process.env.PORT);
console.log('DOMAIN:', process.env.DOMAIN);
console.log('UID_42:', process.env.UID_42);
console.log('SECRET_42:', process.env.SECRET_42);
console.log('CALLBACK_URI:', process.env.CALLBACK_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('FRONT_DOMAIN:', process.env.FRONT_DOMAIN);
console.log('FRONT_SIGN_IN_URL:', process.env.FRONT_SIGN_IN_URL);
console.log('FRONT_HOME_URL:', process.env.FRONT_HOME_URL);
console.log('PSQL_HOST:', process.env.PSQL_HOST);
console.log('PSQL_USERNAME:', process.env.PSQL_USERNAME);
console.log('PSQL_PASSWORD:', process.env.PSQL_PASSWORD);
console.log('PSQL_DBNAME:', process.env.PSQL_DBNAME);
console.log('REDIS_URL:', process.env.REDIS_URL);

  console.log(port);
  const app = await NestFactory.create(AppModule);

  //Cors
  app.enableCors({
    origin: "*",
    credentials: true,
  });

  //Swagger
  const config = new DocumentBuilder()
      .setTitle('TS API DOCS')
      .setDescription('TS API 문서')
      .setVersion('0.0.1')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'Token' },
        'access-token',
      )
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //exception
  app.useGlobalFilters(new CustomExceptionFilter());
  
  //run
  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
