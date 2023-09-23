import { Get, Controller, Param, Query, UseGuards, Post, UseInterceptors, Put, Res, Body } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/scurity/get-user.decorator";
import { User } from "../entity/user.entity";
import { join } from "path";
import * as fs from 'fs';
import { ModifyUserImageRequestDto, UserDto } from "../dto/user.dto";

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

    @Get('/images/list')
    @UseGuards(AuthGuard())
    async getImageList(@GetUser() user: User, @Res() res) {
        try {
            const fileNames = fs.readdirSync(join(__dirname, '../../..', 'assets/images'));
            const imageUrls = fileNames.map((fn) => process.env.DOMAIN + '/images/' + fn);
            imageUrls.push(user.fortytwoImageUrl);
            res.status(200).send(imageUrls);
        } catch (err) {
            console.error('Error reading directory:', err);
            res.status(500).send('Error reading images');
        }
    }

    @Put('/images')
    @UseGuards(AuthGuard())
    async modifyUserImage(@GetUser() user: User, @Body() modifyUserImageDto : ModifyUserImageRequestDto, @Res() res) {
        try {
            if (modifyUserImageDto.imageUrl == null || modifyUserImageDto.imageUrl.length == 0)
                throw new Error;
            await this.userService.modifyUserImageUrl(user, modifyUserImageDto.imageUrl)
            res.status(201).send("Image change success!");
        } catch (err) {
            console.error('Error reading directory:', err);
            res.status(500).send("Image change Fail!");
        }
    }
}