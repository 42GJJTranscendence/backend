import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./channel.entity";
import { ChannelService } from "./channel.service";
import { Module } from "@nestjs/common";


@Module({
    imports: [TypeOrmModule.forFeature([Channel]), Channel],
    providers: [ChannelService],
})
export class ChatModule {}
  