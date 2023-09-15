import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserChannel } from "./user_channel.entity";
import { UserChannelService } from "./user_channel.service";

@Module({
    imports : [TypeOrmModule.forFeature([UserChannel])],
    providers : [UserChannelService],
    exports : [UserChannelService]
})

export class UserChannelModule{}