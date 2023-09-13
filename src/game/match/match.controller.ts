import { Get, Controller, Param, Query, NotFoundException } from "@nestjs/common";
import { MatchService } from "./match.service";
import { UserService } from 'src/module/users/service/user.service';

@Controller('match')
export class MatchController {

    constructor (
        private userService : UserService,
        private matchService : MatchService,
    ){}

    @Get('/match')
    async getMatchs(@Query('username') username : string) {
        const user = await this.userService.findOneByUsername(username);

        if (!user) {
            throw new NotFoundException(`User with username ${username} not found`);
        }
        const matches = await this.matchService.getMatches(user);
        return matches;
    }
}