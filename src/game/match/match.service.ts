import { Injectable } from '@nestjs/common';
import { Match } from './match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
}
