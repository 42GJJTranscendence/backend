import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LogInRequestDto, SignInRequestDto } from "./dto/auth.dto";
import { AuthGuard } from "@nestjs/passport";
import { User } from "src/users/entity/user.entity";
import { GetUser } from "./scurity/get-user.decorator";


@Controller('auth')
export class AuthController {

    constructor (
        private authService : AuthService,
    ){}

    @Get('/42/oauth')
    AuthRequest(@Res() res) {
        res.redirect (
            `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.UID_42}&redirect_uri=${process.env.CALLBACK_URI}&scope=public&response_type=code`,
        )
    }

    @Get('/42/callback')
    async AuthRedirect(@Query('code') code:string, @Res() res) {
        const fortyTwoToken = await this.authService.authenticate(code, res);
        console.log(`${process.env.FRONT_SIGN_IN_URL}?token=${fortyTwoToken}`);
        res.redirect(`${process.env.FRONT_SIGN_IN_URL}?token=${fortyTwoToken}`);
    }

    @Post('/signin')
    async SignInUser(@Body() signInRequestDto : SignInRequestDto, @Res() res) {
        console.log("username : ", signInRequestDto.username, "\npassword : ", signInRequestDto.password, "\neMail : ", signInRequestDto.email,"\nfortyTwoToken : ", signInRequestDto.fortyTwoToken);
        const jwtAccessToken = await this.authService.signInUser(signInRequestDto);

        console.log('ACCESS_TOKEN : ', jwtAccessToken);
        res.send(jwtAccessToken);
    }

    @Post('/login')
    async UserLogin(@Body() logInRequestDto : LogInRequestDto, @Res() res) : Promise<any>{
        console.log("LogInRequestDto : {\n", "\n    username: ", logInRequestDto.username, "\n  password: ", logInRequestDto.password);

        const logInResponseDto = await this.authService.validateUserPassword(logInRequestDto);

        return res.json({ logInResponseDto });
    }

    @Get('/check/duplication')
    async checkDuplication(@Query('username') username : string){
        return await this.authService.checkDuplication(username);
    }

    @Get('/verification/email')
    async sendVerificationMail(@Query('email') email : string, @Res() res) {
        this.authService.sendVerificationCode(email);
        res.send(200);
    }

    @Get('/verification/email/check')
    async checkVerificationMailCode(@Query('email') email : string, @Query('code') code : string) {
        console.log("email :", email,"\ncode :", code);
        return await this.authService.checkVerificationCode(email, code);
    }

    @Get('/cookie')
    async CookieTest(@Res() res) : Promise<any>{
        // 쿠키 설정
        const cookieOptions = {
            httpOnly: true, // 클라이언트 스크립트로 쿠키 접근 불가
            maxAge: 3600, // 쿠키 유효 기간 (초)
            // secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
            // 다른 쿠키 옵션들도 설정 가능
        };

        const logInRequestDto = new LogInRequestDto();
        logInRequestDto.username = 'jaehyuki';
        logInRequestDto.password = '1234';
        const jwtAccessToken = await this.authService.validateUserPassword(logInRequestDto);

        console.log('ACCESS_TOKEN : ', jwtAccessToken);

        res.cookie('access_token', jwtAccessToken, cookieOptions);
        res.redirect(`${process.env.FRONT_HOME_URL}`);
    }

    @Get('/test')
    @UseGuards(AuthGuard())
    async AuthTest(@GetUser() user : User, @Res() res) {
        console.log('req', user);
        res.send(200, user.username);
    }
}