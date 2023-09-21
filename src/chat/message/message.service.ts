import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Message } from "./message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/module/users/entity/user.entity";
import { Channel } from "../channel/channel.entity";
import { UserDto } from "src/module/users/dto/user.dto";

@Injectable()
export class MessageService {

    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) { }

    async createMessage(user: User, channel: Channel, content: string) {
        try {
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
            throw error;
        }
    }

    async findMessageHistory(channelId: number) {
        const messageHistorys = await this.messageRepository.find({
            where: { channel: { id: channelId } }, // channelId로 필터링
            relations: ['user'],
            order: { createdAt: 'ASC' }, // createdAt 필드를 오래된 순서로 정렬
        });

        return Array.from(messageHistorys).map((mh) => ({ id: mh.id, writer: mh.user.username, content: mh.content, createdAt: mh.createdAt, imageUrl: mh.user.imageUrl }))
    }
}