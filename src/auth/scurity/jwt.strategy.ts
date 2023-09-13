import { Injectable, UnauthorizedException } from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from "src/module/users/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User)
        private userRepository : Repository<User>,
    ) {
        super({
            secretOrKey : process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(), // "Bearer" 스킴 확인
                (req) => req.cookies.access_token, // 쿠키에서 토큰 추출
              ]),
        })
    }

    async validate(payload) {
        const { username } = payload;
        const user: User = await this.userRepository.findOne({ where: { username: username }});

        if (!user) {
            throw new UnauthorizedException(); 
        }

        return user;
    }
}