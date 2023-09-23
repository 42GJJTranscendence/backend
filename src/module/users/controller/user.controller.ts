import { Get, Controller, Param, Query, UseGuards, Post, UseInterceptors } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/scurity/get-user.decorator";
import { User } from "../entity/user.entity";
import { UserDto } from "../dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { diskStorage } from 'multer';
import { FileInterceptor } from "@nestjs/platform-express";
import { existsSync, unlinkSync } from "fs";
import { extname } from "path";

@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
    ) { }

    @Get('detail/my')
    @UseGuards(AuthGuard())
    async getUserInfo(@GetUser() user: User) {
        return UserDto.from(user);
    }

    @Get('detail/:username')
    async getTargetUserInfo(@Param('username') username: string) {
        return UserDto.from(await this.userService.findOneByUsername(username));
    }

    @Get('/check/duplication')
    async CheckDuplicationUserName(@Query('username') username: string) {
        console.log(username);
        let user = await this.userService.findOneByUsername(username);
        console.log(user);
        if (user != null) {
            return true;
        }
        else
            return false;
    }
}