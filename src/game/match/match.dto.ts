import { UserDto } from "src/module/users/dto/user.dto";
import { Match } from "./match.entity";

export class MatchDto{
    id: number;
    userHome: UserDto;
    userAway: UserDto;
    winner: UserDto;
    user_home_score: number;
    user_away_score: number;
    start_at: Date;

    static from(match: Match): MatchDto {
        const matchDto = new MatchDto();
        matchDto.id = match.id;
        matchDto.userHome = UserDto.from(match.userHomeId);
        matchDto.userAway = UserDto.from(match.userAwayId);
        matchDto.winner = UserDto.from(match.winnerId);
        matchDto.user_home_score = match.user_home_score;
        matchDto.user_away_score = match.user_away_score;
        return matchDto;
    }
}