import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from "src/module/users/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
                    if (token) {
                        return token;
                    }

                    try {
                        return req.cookies.access_token;
                    } catch (error) {
                        throw new UnauthorizedException('Access token is missing');
                    }
                },
            ]),
        })
    }

    async validate(payload) {
        const { username } = payload;
        const user: User = await this.userRepository.findOne({ where: { username: username } });

        if (!user) {
            throw new UnauthorizedException('Access token is not valid');
        }

        return user;
    }
}