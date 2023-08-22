import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventModule } from './event/event.module';

@Module({
  imports: [EventModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
