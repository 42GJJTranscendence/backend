import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findOneByUserId(userId: number): Promise<User> {
        return await this.userRepository
            .createQueryBuilder('u')
            .where('u.id = :userId', { userId: userId })
            .getOne();
    }
}