import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { UserChannelModule } from './user_channel/user_channel.module';
import { MessageModule } from './message/message.module';
import { UsersModule } from 'src/module/users/users.module';
import { FriendMoudle } from 'src/module/users/friend/friend.module';
import { ChannelbannedModule } from './channel_banned/channel_banned.module';
import { ChannelMuteModule } from './channel_mute/channel_mute.module';

@Module({
  imports: [AuthModule,
    ChannelModule,
    UserChannelModule,
    MessageModule,
    UsersModule,
    FriendMoudle,
    ChannelbannedModule,
    ChannelMuteModule],
  providers: [ChatGateway],
})

export class ChatModule { }
