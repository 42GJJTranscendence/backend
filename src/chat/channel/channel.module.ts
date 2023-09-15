import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";
import { Module } from "@nestjs/common";
import { UserChannelService } from "../user_channel/user_channel.service";
import { UserChannel } from "../user_channel/user_channel.entity";
import { ChannelController } from "./channel.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { MessageService } from "../message/message.service";


@Module({
    imports: [TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([UserChannel]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ],

    providers: [ChannelService, UserChannelService],

    controllers: [ChannelController],

    exports: [ChannelService],
})
export class ChannelModule { }
