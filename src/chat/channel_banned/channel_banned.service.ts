import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelBanned } from "./channel_banned.entity";
import { privateDecrypt } from "crypto";
import { Repository } from "typeorm";
import { Channel } from "../channel/channel.entity";
import { User } from "src/module/users/entity/user.entity";
import { async } from "rxjs";

@Injectable()
export class ChannelBannedService {
    constructor(
        @InjectRepository(ChannelBanned)
        private channelBannedRepository: Repository<ChannelBanned>,
    ){}

    // async addUserBan(channel : Channel, user: User) {
    //     const create = await this.
    // }
}