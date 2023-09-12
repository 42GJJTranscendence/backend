import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/users/entity/user.entity";
import { FortyTwoUserDto, LogInRequestDto, SignInRequestDto, FortyTwoTokenJsonInterface } from "./dto/auth.dto";
import { UserDto } from "src/users/dto/user.dto";
import { UserService } from "src/users/service/user.service";
import * as bcrypt from 'bcrypt';
import { Payload } from "./scurity/payload.interface";
import { JwtService } from "@nestjs/jwt";
import { UserDuplicatException } from "src/common/exception/custom.exception";
import { MailerService } from "@nestjs-modules/mailer";
import { RedisClientType } from "redis";

@Injectable()
export class AuthService {

    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redis: RedisClientType,
        private userService : UserService,
        private jwtService : JwtService,
        private readonly mailerService: MailerService,
    ) {}

    async sendVerificationCode(email: string): Promise<void>{
        const code = Math.floor(Math.random() * 1000000).toString();
        await this.mailerService.sendMail({
            to: email,
            subject: 'FortyTwo Transcendence 인증 코드',
            text: `Your verification code is ${code}`,
        });
        console.log("email :", email,"\ncode :", code);
        await this.redis.set(email, code, { EX : 300 });
    }

    async checkVerificationCode(email: string, code: string): Promise<string | undefined> {
        const codeFind = await this.redis.get(email);
        if (codeFind == null || codeFind != code)
            throw new UnauthorizedException('Email authorize faile.');
        else {
            await this.redis.del(email);
            const userFind : User = await this.userService.findOneByUserEmail('abc');
            if (userFind == null)
                return undefined;
            const payload: Payload = { id: userFind.id, username: userFind.username, fortyTwoId: userFind.fortyTwoId};
            return Promise.resolve(this.jwtService.sign(payload));
        }
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

    async signInUser(signInRequestDto : SignInRequestDto) {
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
    }

    async validateUserPassword(logInRequestDto: LogInRequestDto): Promise<string | undefined> {
        let userFind: User = await this.userService.findOneByUsername(logInRequestDto.username);
        const validatePassword = await bcrypt.compare(logInRequestDto.password, userFind.password);
        if(!userFind || !validatePassword) {
            throw new UnauthorizedException('Invalid password');
        }

        return Promise.resolve( userFind.eMail );
    }

    vaildateUserToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded; // JWT 토큰이 유효한 경우 사용자 정보를 반환
        } catch (error) {
            throw new UnauthorizedException('Invalid token'); // 토큰이 유효하지 않은 경우 예외 발생
        }
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