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
import { UsersModule } from 'src/module/users/users.module';
import { ChatModule } from 'src/chat/chat.module';
import { PassportModule } from '@nestjs/passport';
import { MatchController } from './match/match.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), Match, TypeOrmModule.forFeature([User]), User, AuthModule, UsersModule, ChatModule,
  PassportModule.register({ defaultStrategy: 'jwt' }),],
  providers: [GameGateway, GameService, MatchService, UserService],
  controllers: [GameController, MatchController],
})
export class GameModule { }
