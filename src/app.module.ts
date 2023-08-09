import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [TypeOrmModule.forRoot({
    "type": "postgres",
    "host": "postgresql",
    "port": "5432",
    "username": "jaehyuki",
    "password": "1234",
    "database": "MAIN",
    "synchronize": "true",
    "logging": "true",
    "entities": ["./src/**/*.entity.{.tx,.js}", "./dist/**/*.entity.{.ts,.js}"]
}),
],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
