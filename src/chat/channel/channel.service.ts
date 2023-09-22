import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Channel } from "./channel.entity";
import { createChannelRequestDto } from "./channel.dto";
import * as bcrypt from 'bcrypt';
import { User } from "src/module/users/entity/user.entity";
import { UserChannelService } from "../user_channel/user_channel.service";
import { ChannelType } from "src/common/enums";

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        private userChannelService: UserChannelService
    ) { }

    async findAll(): Promise<Channel[]> {
        return await this.channelRepository.find();
    }

    async findOneById(id: number): Promise<Channel> {
        if (id == undefined || id == null)
            return null;
        return await this.channelRepository.findOne({ where: { id } });
    }

    async findUserJoinedChannels(user: User): Promise<Channel[]> {
        const userChannels = await this.userChannelService.findByUser(user);
        console.log(userChannels);
        const channels = Array.from(userChannels)
            .filter(uc => uc.channel.type !== 'DIRECT')
            .map(uc => uc.channel);
        return channels;
    }

    async findDirectChannelForUser(user1Id: number, user2Id: number): Promise<Channel | null> {
        let channel = await this.channelRepository
            .createQueryBuilder('channel')
            .innerJoinAndSelect('channel.userChannel', 'userChannel')
            .innerJoin('userChannel.user', 'user')
            .where('channel.type = :type', { type: 'DIRECT' })
            .andWhere('user.id IN (:user1Id, :user2Id)', { user1Id, user2Id })
            .groupBy('channel.id, userChannel.id')
            .getMany();
        // console.log(channel.getQuery())
        // console.log('FINDING USER : ', user1Id, ' ', user2Id);
        // console.log('QUERY OUTPUT : ', channel);

        // channel.forEach ((channel) => console.log(channel.userChannel.length));
        channel = channel.filter((c) => c.userChannel.length == 2)
        if (channel.length == 0)
            return null;
        else if (channel.length >= 1)
            return channel[0];
        else {
            console.log("CHANNEL_LENGTH : ", channel.length);
            throw new Error;
        }
        // return channel || null;
    }

    async createDirectChannelForUser(user1: User, user2: User): Promise<Channel | null> {
        const channel = new Channel();

        channel.title = 'DM Chating';
        channel.type = ChannelType.DIRECT;

        const createdChannel = await this.channelRepository.save(channel);
        await this.userChannelService.addUser(channel, user1);
        await this.userChannelService.addUser(channel, user2);
        return createdChannel;
    }

    async createChannel(createChannelDto: createChannelRequestDto, user: User): Promise<Channel | undefined> {
        const channel = new Channel();

        channel.title = createChannelDto.title;

        if (createChannelDto.password != null) {
            const saltRounds = 10;
            channel.password = await bcrypt.hash(createChannelDto.password, saltRounds);
        }
        channel.type = createChannelDto.type;

        const createdChannel = await this.channelRepository.save(channel);
        await this.userChannelService.addAdminUser(channel, user);
        return createdChannel;
    }

    async deleteChannel(channelId: number) {
        // try {
        await this.channelRepository
            .createQueryBuilder()
            .delete()
            .where('id = :channelId', { channelId })
            .execute();
        // } catch (error) {
        //     console.log('DELETE ERROR : ', error);
        // }
    }
}