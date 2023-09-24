import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserChannel } from "./user_channel.entity";
import { UserChannelService } from "./user_channel.service";
import { Channel } from "../channel/channel.entity";
import { ChannelService } from "../channel/channel.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserChannel]),
    TypeOrmModule.forFeature([Channel])],
    providers: [UserChannelService, ChannelService],
    exports: [UserChannelService]
})

export class UserChannelModule { }