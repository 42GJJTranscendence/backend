import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelBanned } from "./channel_banned.entity";
import { ChannelBannedService } from "./channel_banned.service";

@Module({
    imports : [TypeOrmModule.forFeature([ChannelBanned])],
    providers : [ChannelBannedService],
    exports : [ChannelBannedService]
})

export class ChannelbannedModule{}