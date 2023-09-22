import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";
import { Channel } from "../channel/channel.entity";
import { User } from "src/module/users/entity/user.entity";
import { ChannelMute } from "./channel_mute.entity";

@Injectable()
export class ChannelMuteService {
    constructor(
        @InjectRepository(ChannelMute)
        private channelMuteRepository: Repository<ChannelMute>,
    ) { }

    async addChannelMuteUser(channel: Channel, user: User) {
        const create = await this.channelMuteRepository.createQueryBuilder()
            .insert()
            .into(ChannelMute)
            .values([
                {
                    user: user,
                    channel: channel,
                    until: new Date(Date.now() + 60 * 1000),
                }
            ])
            .execute();
    }

    async isUserMuteFromChannel(user: User, channel: Channel) {
        const channelMute = await this.channelMuteRepository.findOne({
            where: {
                user: {id : user.id},
                channel: {id : channel.id},
                until: MoreThanOrEqual(new Date()),
            },
        })

        if (channelMute != null)
            return true;
        else
            return false;
    }
}