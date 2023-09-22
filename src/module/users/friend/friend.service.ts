import { Inject, Injectable, Module } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserChannel } from "src/chat/user_channel/user_channel.entity";
import { Friend } from "./friend.entity";
import { Repository } from "typeorm";
import { User } from "../entity/user.entity";

@Injectable()
export class FriendService {
    constructor(
        @InjectRepository(Friend)
        private friendRepository: Repository<Friend>,
    ) { }

    async findFollowingFriendsByUser(user: User) {
        return await this.friendRepository.find({
            where: {
                user: { id: user.id }
            },
            relations: ['user', 'followedUser'],
        })
    }

    async findFollowerFriendsByUser(user: User) {
        return await this.friendRepository.find({
            where: {
                followedUser: { id: user.id }
            },
            relations: ['user', 'followedUser'],
        })
    }

    async followUser(user: User, targetUser: User) {
        const create = await this.friendRepository.createQueryBuilder()
            .insert()
            .into(Friend)
            .values([
                {
                    user: user,
                    followedUser: targetUser,
                }
            ])
            .execute();
    }

    async isFollowUser(user: User, targetUser: User) {
        const Friend = await this.friendRepository.findOne({
            where: {
                user: { id: user.id },
                followedUser: { id: targetUser.id }
            },
        })

        if (Friend != null)
            return true;
        else
            return false;
    }

    async cancelFollowUser(userId: number, targetUserId: number) {

        await this.friendRepository
            .createQueryBuilder()
            .delete()
            .where('userId = :userId', { userId })
            .andWhere('followedUserId = :targetUserId', { targetUserId })
            .execute();
    }
}
