import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  // imports: [TypeOrmModule.forRoot()],
  imports: [TypeOrmModule.forRoot({
    type: 'postgres', // Since we are using PostgreSQL.
    host: 'localhost', // We are devoloping locally.
    port: 5432, // What we set in our docker-compose file.
    username: 'jaehyuki', // ""
    password: '1234', // "pretty straightforward haha"
    database: 'main', // db name.
    autoLoadEntities: true, // help load entities automatically.
    synchronize: true, // insures our entities are sync with the database every time we run our app.
  })],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
