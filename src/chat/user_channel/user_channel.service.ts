// user-channels.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserChannel } from './user_channel.entity';
import { Channel } from '../channel/channel.entity';
import { User } from 'src/module/users/entity/user.entity';

@Injectable()
export class UserChannelService {
  constructor(
    @InjectRepository(UserChannel)
    private userChannelRepository: Repository<UserChannel>,
  ) { }

  async addAdminUser(channel: Channel, user: User) {
    const create = await this.userChannelRepository.createQueryBuilder()
      .insert()
      .into(UserChannel)
      .values([
        {
          channel: channel,
          user: user,
          is_owner: true,
        }
      ])
      .execute();
  }

  async findByUser(user: User) : Promise<UserChannel[]> {
    return await this.userChannelRepository.find({
      where: { user: user }, // user 엔티티와 매핑된 user 필드를 사용하여 조회
      relations: ['channel'], 
    });
  }
}
