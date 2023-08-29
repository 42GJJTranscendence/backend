import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const gameService = app.get(GameService);

  await app.listen(5000);
  app.useWebSocketAdapter(new IoAdapter(app));

  // gameService.startGameLoop();
}
bootstrap();
