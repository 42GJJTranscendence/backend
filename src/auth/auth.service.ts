import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/modules/users/entity/user.entity";
import { FortyTwoUserDto, LogInRequestDto, SignInRequestDto, FortyTwoTokenJsonInterface } from "./dto/auth.dto";
import { UserDto } from "src/modules/users/dto/user.dto";
import { UserService } from "src/modules/users/service/user.service";
import * as bcrypt from 'bcrypt';
import { Payload } from "./scurity/payload.interface";
import { JwtService } from "@nestjs/jwt";
import { UserDuplicatException } from "src/common/exception/custom.exception";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class AuthService {

    constructor(
        private userService : UserService,
        private jwtService : JwtService,
        private readonly mailerService: MailerService,
    ) {}

  async sendVerificationCode(email: string): Promise<void>{
    const code = Math.floor(Math.random() * 10000).toString();
    await this.mailerService.sendMail({
      to: email,
      subject: 'FortyTwo Transcendence 인증 코드',
      text: `Your verification code is ${code}`,
    });
  }

    async getToken(code: string, res: Response): Promise<string> {
        console.log("now retrieving token...");
        const body = {
            "grant_type": 'authorization_code',
            "client_id": process.env.UID_42,
            "client_secret": process.env.SECRET_42,
            "redirect_uri": process.env.CALLBACK_URI,
            "code": code,
        }
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        };
        console.log("Sending request:", options);
        const token = await fetch("https://api.intra.42.fr/oauth/token", options)
            .then(async (response) => {
                const json = await response.json() as FortyTwoTokenJsonInterface;
                console.log(json);
                if (!response.ok) {
                    return Promise.reject(json.message);
                }
                return json.access_token as string;
            })
            .catch((error) => {
                console.log(error);
                return '';
            });
        return Promise.resolve(token);
    }

    async getUser(token: string): Promise<FortyTwoUserDto | undefined> {
        
        //authenticate user with 42intra token
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            },
        };
        return fetch("https://api.intra.42.fr/v2/me", options)
            .then(async (response) => {
                if (!response.ok) {
                    return Promise.reject(`Error ${response.status}: Failed to get user infos`);
                }
                const json = await response.json() as FortyTwoUserDto;
                if (json.hasOwnProperty('id') && json.hasOwnProperty('login')) {
                    const id42 = json.id;
                    const username = json.login;
                    const imageUrl = json.image.link;
                    console.log("Get User\n{", "\nid:", id42, "\nusername:", username, "\ntoken:", token, "\nimageUrl: ", imageUrl), "\n}";
                    return json;
                } else
                    return undefined;
            })
            .catch((error) => {
                console.log(error);
                return undefined;
            });
    }

    async authenticate(code: string, res: Response): Promise<String> {
        const token = await this.getToken(code, res);
        if (token == '')
            return undefined;
        return token;
    }

    async signInUser(signInRequestDto : SignInRequestDto): Promise<String | undefined> {
        if (await this.checkDuplication(signInRequestDto.username) == true) {
            throw new UserDuplicatException();
        }
        const fortyTwoUserDto = await this.getUser(signInRequestDto.fortyTwoToken);
        const user = new User();
        user.username=signInRequestDto.username;
        user.eMail=signInRequestDto.email;
        user.imageUrl = fortyTwoUserDto.image.link;
        user.fortyTwoId = fortyTwoUserDto.id;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(signInRequestDto.password, saltRounds);
        user.password = hashedPassword;

        const createdUser = await this.userService.createUser(user);

        const payload: Payload = { id: createdUser.id, username: createdUser.username, fortyTwoId: createdUser.fortyTwoId};
        
        return Promise.resolve(this.jwtService.sign(payload));
    }

    async validateUser(logInRequestDto: LogInRequestDto): Promise<string | undefined> {
        let userFind: User = await this.userService.findOneByUsername(logInRequestDto.username);
        const validatePassword = await bcrypt.compare(logInRequestDto.password, userFind.password);
        if(!userFind || !validatePassword) {
            throw new UnauthorizedException();
        }
    
        const payload: Payload = { id: userFind.id, username: userFind.username, fortyTwoId: userFind.fortyTwoId};
        
        return Promise.resolve(await this.jwtService.sign(payload));
    }

    async checkDuplication(username : string): Promise<Boolean> {
        let userFind: User = await this.userService.findOneByUsername(username);
        if (userFind == null)
            return false;
        else
        {
            return true;
        }
    }
}