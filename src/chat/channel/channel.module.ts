import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";
import { Module } from "@nestjs/common";
import { UserChannelService } from "../user_channel/user_channel.service";
import { UserChannel } from "../user_channel/user_channel.entity";
import { ChannelController } from "./channel.controller";
import { PassportModule } from "@nestjs/passport";
import { ChannelBannedService } from "../channel_banned/channel_banned.service";
import { ChannelBanned } from "../channel_banned/channel_banned.entity";


@Module({
    imports: [TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([UserChannel]),
    TypeOrmModule.forFeature([ChannelBanned]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ],

    providers: [ChannelService, UserChannelService, ChannelBannedService],

    controllers: [ChannelController],

    exports: [ChannelService],
})
export class ChannelModule { }
