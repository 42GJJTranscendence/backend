import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Channel } from "./channel.entity";
import { createChannelRequestDto } from "./channel.dto";
import * as bcrypt from 'bcrypt';
import { User } from "src/module/users/entity/user.entity";
import { UserChannel } from "../user_channel/user_channel.entity";
import { UserChannelService } from "../user_channel/user_channel.service";

@Injectable()
export class ChannelService
{
    constructor(
        @InjectRepository(Channel)
        private channelRepository : Repository<Channel>,
        private userChannelService : UserChannelService
    ) {}

    async findOneById(id : number) : Promise<Channel> {
        return await this.channelRepository.findOne({ where : {id}});
    }

    async createChannel(createChannelDto : createChannelRequestDto, user : User) : Promise<Channel | undefined> {
        const saltRounds = 10;
        const channel = new Channel();
        
        channel.title=createChannelDto.title;
        channel.password = await bcrypt.hash(createChannelDto.password, saltRounds);
        channel.type = createChannelDto.type;
        channel.userChannel;

        const createdChannel = await this.channelRepository.save(channel);
        await this.userChannelService.addAdminUser(channel, user);
        return createdChannel;
    }
}