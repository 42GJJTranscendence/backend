import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as socketio from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';

const port = process.env.PORT || 5000;

async function bootstrap() {
  console.log(port);
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
