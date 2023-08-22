import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/users/entity/user.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seedUsers(): Promise<void> {
    const usersData = [
      { userName: 'user1', password: '1234', eMail: 'user1@example.com', imageUrl: 'sample.jpeg' },
      { userName: 'user2', password: '1234', eMail: 'user2@example.com', imageUrl: 'sample.jpeg' },
      { userName: 'user3', password: '1234', eMail: 'user3@example.com', imageUrl: 'sample.jpeg' },
    ];

    for (const userData of usersData) {
      const user = this.userRepository.create(userData);
      await this.userRepository.save(user);
    }

    Logger.log('Initial users seeded', 'SeederService');
  }
}
