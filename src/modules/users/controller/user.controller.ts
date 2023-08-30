import { Get, Controller, Param, Query } from "@nestjs/common";
import { UserService } from "../service/user.service";

@Controller('users')
export class UserController {

    constructor (
        private userService : UserService,
    ){}

    @Get('/check/duplication')
    CheckDuplicationUserName(@Query('username') username : string) {
        let user = this.userService.findOneByUsername(username);

        if (user == null) {
            return true;
        }
        else
            return false;
    }
}