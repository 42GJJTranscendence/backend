import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInRequestDto, SignInRequestDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/module/users/entity/user.entity';
import { GetUser } from './scurity/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/42/oauth')
  AuthRequest(@Res() res) {
    res.redirect(
      `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.UID_42}&redirect_uri=${process.env.CALLBACK_URI}&scope=public&response_type=code`,
    );
  }

  @Get('/42/callback')
  async AuthRedirect(@Query('code') code: string, @Res() res) {
    console.log('/42/callback');
    const fortyTwoToken = await this.authService.authenticate(code, res);
    console.log(`${process.env.FRONT_SIGN_IN_URL}?token=${fortyTwoToken}`);
    res.redirect(`${process.env.FRONT_SIGN_IN_URL}?token=${fortyTwoToken}`);
  }

  @Post('/signin')
  async SignInUser(@Body() signInRequestDto: SignInRequestDto, @Res() res) {
    console.log(
      'username : ',
      signInRequestDto.username,
      '\npassword : ',
      signInRequestDto.password,
      '\neMail : ',
      signInRequestDto.email,
      '\nfortyTwoToken : ',
      signInRequestDto.fortyTwoToken,
    );
    await this.authService.signInUser(signInRequestDto);

    res.status(201).send('User created successfully');
  }

  @Post('/login')
  async UserLogin(
    @Body() logInRequestDto: LogInRequestDto,
    @Res() res,
  ): Promise<any> {
    console.log(
      'LogInRequestDto : {\n',
      '\n    username: ',
      logInRequestDto.username,
      '\n  password: ',
      logInRequestDto.password,
    );

    const userEmail = await this.authService.validateUserPassword(
      logInRequestDto,
    );

    return res.send(userEmail);
  }

  @Get('/check/duplication')
  async checkDuplication(@Query('username') username: string) {
    return await this.authService.checkDuplication(username);
  }

  @Post('/signin/verification/email')
  async sendVerificationSignInMail(@Query('email') email: string, @Res() res) {
    this.authService.sendVerificationCode(email);
    res.status(201).send('User verification code sended.');
  }

  @Post('/login/verification/email')
  async sendVerificationLogInMail(@Query('email') email: string, @Res() res) {
    this.authService.sendVerificationCode(email);
    res.status(201).send('User verification code sended.');
  }

  @Get('/signin/verification/email/check')
  async checkVerificationMailSignInCode(
    @Query('email') email: string,
    @Query('code') code: string,
    @Res() res,
  ) {
    console.log('email :', email, '\ncode :', code);
    await this.authService.checkVerificationCode(email, code);
    res.status(200).send('User email verification success!');
  }

  @Get('/login/verification/email/check')
  async checkVerificationMailLogInCode(
    @Query('username') username: string,
    @Query('code') code: string,
    @Res() res,
  ) {
    console.log('2FA REQ {username :', username, '\ncode :', code, '}');

    const jwtAccessToken = await this.authService.check2FACode(username, code);
    const cookieOptions = {
      httpOnly: true,
      maxAge: 36000,
    };

    res.cookie('access_token', jwtAccessToken, cookieOptions);
    res.send(jwtAccessToken);
  }

  @Get('/test')
  @UseGuards(AuthGuard())
  async AuthTest(@GetUser() user: User, @Res() res) {
    console.log('req', user);
    res.send(200, user.username);
  }
}
