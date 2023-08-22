import { Controller, Get, Query, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";


@Controller('auth')
export class AuthController {

    constructor (
        private authService : AuthService,
    ){}

    @Get()
    AuthRequest(@Res() res) {
        res.redirect (
            `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.UID_42}&redirect_uri=${process.env.CALLBACK_URI}&scope=public&response_type=code`,
        )
    }
    
    // @Get('/42/callback')
    // Test () {
    //     return "gdgd";
    // }

    @Get('/42/callback')
    async AuthRedirect(@Query('code') code:string, @Res() res) {

        res.status(200).send('Code is ' + code);
        // const user = await this.authService.authenticate(code, res);
        // if (user) {
        //     if (!user.otp_enabled)
        //         res.redirect(`http://${process.env.BACKEND_IP}/login?token=${user.token}`);
        //     else {
        //         res.redirect(`http://${process.env.BACKEND_IP}/2fa?userId=${user.id}`);
        //     }
        // }
        // else res.redirect(`http://${process.env.BACKEND_IP}/login?token=null`);
    }
}