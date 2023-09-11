import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { MatchService } from './match/match.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), Match, AuthModule],
  providers: [GameGateway, GameService, MatchService],
  controllers: [GameController],
})
export class GameModule {}
