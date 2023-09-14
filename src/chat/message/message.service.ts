import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Message } from "./message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/module/users/entity/user.entity";
import { Channel } from "../channel/channel.entity";
import { SendMessageFailException } from "src/common/exception/custom.exception";

@Injectable()
export class MessageService {

    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) { }

    async createMessage(user: User, channel: Channel, content: string) {
    
        try{
            const create = await this.messageRepository.createQueryBuilder()
            .insert()
            .into(Message)
            .values([
                {
                    channel: channel,
                    user: user,
                    content: content,
                }
            ])
            .execute();
        } catch (error) {
            console.log(error);
            throw new SendMessageFailException();
        }
    }
}