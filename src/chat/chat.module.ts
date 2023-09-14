import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { UserChannelModule } from './user_channel/user_channel.module';

@Module({
  imports: [AuthModule, ChannelModule, UserChannelModule],
  providers: [ChatGateway, ChatService],
})

export class ChatModule {}
