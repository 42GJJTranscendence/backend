import { Injectable } from '@nestjs/common';
import { Match } from './match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entity/user.entity';

@Injectable()
export class MatchService {

    constructor(
        @InjectRepository(Match)
        private matchRepository : Repository<Match>,
    ) {}

    async createMatch(match : Match) : Promise<Match | undefined> {
        const createMatch = await this.matchRepository.save(match);
        return createMatch;
    }

    async getMatches(user: User) : Promise<Match[]> {
        const matches = await this.matchRepository
            .createQueryBuilder('match')
            .where('match.user_home = :userId', { userId: user.id })
            .orWhere('match.user_away = :userId', { userId: user.id })
            .orderBy('match.start_at', 'DESC')
            .getMany();
    
        return matches;
    }
    
}
