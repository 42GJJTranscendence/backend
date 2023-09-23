import { Inject, Injectable, Module } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserChannel } from "src/chat/user_channel/user_channel.entity";
import { BlackList } from "./black_list.entity";
import { Repository } from "typeorm";
import { User } from "../entity/user.entity";

@Injectable()
export class BlackListService {
    constructor(
        @InjectRepository(BlackList)
        private blackListRepository: Repository<BlackList>,
    ) { }

    async findBlackListsByUser(user: User) {
        return await this.blackListRepository.find({
            where: {
                user: { id: user.id }
            },
            relations: ['user', 'blackUser'],
        })
    }

    async addBlackUser(user: User, targetUser: User) {
        const create = await this.blackListRepository.createQueryBuilder()
            .insert()
            .into(BlackList)
            .values([
                {
                    user: user,
                    blackUser: targetUser,
                }
            ])
            .execute();
    }

    async removeBlackUser(userId: number, targetUserId: number) {
        await this.blackListRepository
            .createQueryBuilder()
            .delete()
            .where('userId = :userId', { userId })
            .andWhere('blackUserId = :targetUserId', { targetUserId })
            .execute();
    }

    async isBlackUser(userId: number, targetUserId: number) {
        const BlackList = await this.blackListRepository.findOne({
            where: {
                user: { id: userId },
                blackUser: { id: targetUserId }
            },
        })

        if (BlackList != null)
            return true;
        else
            return false;
    }
}
