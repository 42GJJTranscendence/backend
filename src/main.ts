import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SeederService } from './database/migrations/init';

const port = process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seederService = app.get(SeederService);
  await seederService.seedUsers();

  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
