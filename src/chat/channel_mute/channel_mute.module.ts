import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelMute } from "./channel_mute.entity";
import { ChannelMuteService } from "./channel_mute.service";

@Module({
    imports : [TypeOrmModule.forFeature([ChannelMute])],
    providers : [ChannelMuteService],
    exports : [ChannelMuteService]
})

export class ChannelMuteModule{}