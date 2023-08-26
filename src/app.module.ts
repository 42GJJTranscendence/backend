import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { EventsModule } from './events/events.module';
import { GameGateway } from './game/game.gateway';
import { GameService } from './game/game.service';

@Module({
  imports: [EventsModule],
  controllers: [AppController],
  providers: [AppService, GameGateway, GameService],
})
export class AppModule {}
