import { Controller, Get, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/scurity/get-user.decorator';
import { User } from 'src/module/users/entity/user.entity';

@Controller('game')
export class GameController {}
