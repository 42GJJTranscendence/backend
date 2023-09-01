import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    // TypeOrmModule.forRoot(typeOrmConfig),
    // UsersModule,
    // AuthModule,
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: '300s' },
    // }),
    ChatModule,
    GameModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
