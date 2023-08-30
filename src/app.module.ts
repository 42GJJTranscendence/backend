import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from './events/events.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig)
    , UsersModule, AuthModule
    , JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '300s' },
    }), EventsModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
