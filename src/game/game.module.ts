import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { MatchService } from './match/match.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match/match.entity';
import { UserService } from 'src/module/users/service/user.service';
import { User } from 'src/module/users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), Match, TypeOrmModule.forFeature([User]), User, AuthModule,],
  providers: [GameGateway, GameService, MatchService, UserService],
  controllers: [GameController],
})
export class GameModule {}
