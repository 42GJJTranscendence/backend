import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LogInRequestDto, SignInRequestDto } from "./dto/auth.dto";
import { profileEnd } from "console";


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
        const jwtAccessToken = this.authService.signInUser(signInRequestDto);

        // 쿠키 설정
        const cookieOptions = {
            httpOnly: true, // 클라이언트 스크립트로 쿠키 접근 불가
            maxAge: 3600, // 쿠키 유효 기간 (초)
            // secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
            // 다른 쿠키 옵션들도 설정 가능
        };

        console.log('ACCESS_TOKEN : ', jwtAccessToken);
        res.cookie('access_token', jwtAccessToken, cookieOptions);

        // 리다이렉트
        res.redirect(`${process.env.FRONT_HOME_URL}`);
    }

    @Post('/login')
    async CookieTest(@Body() logInRequestDto : LogInRequestDto, @Res() res) : Promise<any>{
        // 쿠키 설정
        const cookieOptions = {
            httpOnly: true, // 클라이언트 스크립트로 쿠키 접근 불가
            maxAge: 3600, // 쿠키 유효 기간 (초)
            // secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
            // 다른 쿠키 옵션들도 설정 가능
        };

        const jwtAccessToken = this.authService.validateUser(logInRequestDto);

        console.log('ACCESS_TOKEN : ', jwtAccessToken);
        res.cookie('access_token', jwtAccessToken, cookieOptions);

        // 리다이렉트
        // res.redirect(`${process.env.FRONT_HOME_URL}`);s
        // res.send(jwtAccessToken);
        // return res.json(jwtAccessToken);
        res.redirect(`${process.env.FRONT_HOME_URL}`);
    }
}