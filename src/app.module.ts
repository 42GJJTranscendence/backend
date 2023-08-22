import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { SeederService } from './database/migrations/init';
import { User } from './modules/users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), TypeOrmModule.forFeature([User])
    , UsersModule, AuthModule,],
  controllers: [AppController],
  providers: [AppService, SeederService],
})

export class AppModule {}
