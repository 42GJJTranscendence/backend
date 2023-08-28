import { Injectable } from "@nestjs/common";
import { User } from "src/modules/users/entity/user.entity";
import { FortyTwoTokenJsonInterface } from "src/common/api.object";
import { FortyTwoUserDto } from "./auth.FortyTwoUser.dto";
import { UserDto } from "src/modules/users/dto/user.dto";
import { UserService } from "src/modules/users/service/user.service";


@Injectable()
export class AuthService {

    constructor(private userService : UserService) {}

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

    async getUser(token: string): Promise<String>{//Promise<User | undefined> {
        
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
                    console.log("id:", id42, "username:", username, "token:", token, "imageUrl", imageUrl);
                    return json;
                    // exchange intra token with jwt
                    // const secret = authenticator.generateSecret();
                    // const jwtoken = jwt.sign({userId: id42}, process.env.JWT_SECRET, {expiresIn: "3d"})
                    // return await this.logUser(id42, username, jwtoken);
                } else
                    return undefined;
            })
            .catch((error) => {
                console.log(error);
                return undefined;
            });
    }

    async authenticate(code: string, res: Response): Promise<String>{//Promise<User | undefined> {
        const token = await this.getToken(code, res);
        if (token == '')
            return undefined;
        return this.getUser(token);
    }

    async validateUser(userDTO: UserDto): Promise<{accessToken: string} | undefined> {
        let userFind: User = await this.userService.findOneByFields({
            where: { username: userDTO.username }
        });
        const validatePassword = await bcrypt.compare(userDTO.password, userFind.password);
        if(!userFind || !validatePassword) {
            throw new UnauthorizedException();
        }
    
        const payload: Payload = { id: userFind.id, username: userFind.username };
    
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}