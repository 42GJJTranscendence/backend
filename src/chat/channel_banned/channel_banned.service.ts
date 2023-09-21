import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelBanned } from "./channel_banned.entity";
import { privateDecrypt } from "crypto";
import { MoreThanOrEqual, Repository } from "typeorm";
import { Channel } from "../channel/channel.entity";
import { User } from "src/module/users/entity/user.entity";

@Injectable()
export class ChannelBannedService {
    constructor(
        @InjectRepository(ChannelBanned)
        private channelBannedRepository: Repository<ChannelBanned>,
    ) { }

    async addChannelBanUser(channel: Channel, user: User) {
        const create = await this.channelBannedRepository.createQueryBuilder()
            .insert()
            .into(ChannelBanned)
            .values([
                {
                    channel: channel,
                    user: user,
                    until: new Date(Date.now() + 60 * 1000),
                }
            ])
            .execute();
    }

    async isUserBannedFromChannel(user: User, channel: Channel) {
        const channelBanned = await this.channelBannedRepository.findOne({
            where: {
                user: {id : user.id},
                channel: {id : channel.id},
                until: MoreThanOrEqual(new Date()),
            },
        })

        if (channelBanned != null)
            return true;
        else
            return false;
    }
}