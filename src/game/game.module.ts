import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { MatchService } from './match/match.service';

@Module({
  providers: [GameGateway, GameService, MatchService],
  controllers: [GameController],
})
export class GameModule {}
