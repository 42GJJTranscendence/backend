import { Module } from '@nestjs/common';
// import { AppService } from './app.service';
import { AppGateway } from './app.gateway'

@Module({
  imports: [],
  controllers: [],
  providers: [AppGateway],
})

export class AppModule {}
