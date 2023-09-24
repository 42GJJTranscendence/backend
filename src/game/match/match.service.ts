import { Injectable } from '@nestjs/common';
import { Match } from './match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/module/users/entity/user.entity';

@Injectable()
export class MatchService {

    constructor(
        @InjectRepository(Match)
        private matchRepository: Repository<Match>,
    ) { }

    async createMatch(match: Match): Promise<Match | undefined> {
        const createMatch = await this.matchRepository.save(match);
        return createMatch;
    }

    async getMatches(user: User): Promise<Match[]> {
        const matches = await this.matchRepository.find({
            where: [{ userAwayId: user }, { userHomeId: user }],
            order: {
                start_at: 'DESC',
            },
            relations: ['userHomeId', 'userAwayId']
        })

        console.log(matches);

        return matches;
    }

}
