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

    // @Post('upload')
    // @UseInterceptors(FileInterceptor('image', {
    //     storage: diskStorage({
    //         destination: './public/images',
    //         filename: (req, file, callback) => {
    //             // 기존 이미지 삭제
    //             const preImageName = `${randomName}${extname(file.originalname)}`
    //             const imagePath = `./public/images/${req.body.imageName}`;
    //             if (existsSync(imagePath)) {
    //                 unlinkSync(imagePath);
    //             }

    //             // 새로운 이미지 파일 이름 생성
    //             const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    //             req.body.imageName = `${randomName}${extname(file.originalname)}`;
    //             return callback(null, req.body.imageName);
    //         },
    //     }),
    // }))
    // uploadImage(@UploadedFile() file) {
    //     // 이미지 업로드가 성공하면 처리할 코드
    // }
}